import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# --- 1. MOCK DATA GENERATOR ---
def generate_mock_data():
    data = []
    # 0 = Monday, 6 = Sunday
    for day in range(7):
        for hour in range(8, 22):  # 8 AM to 10 PM
            # Base occupancy based on hour
            if 11 <= hour <= 14 or 17 <= hour <= 20:
                base_occupancy = 0.85
            elif 9 <= hour <= 10 or 15 <= hour <= 16:
                base_occupancy = 0.50
            else:
                base_occupancy = 0.20
            
            if day >= 5: # Weekend adjustment
                base_occupancy += 0.1

            occupancy = min(1.0, max(0.0, base_occupancy + random.uniform(-0.1, 0.1)))
            
            data.append({
                'day_of_week': day,
                'hour': hour,
                'occupancy_rate': occupancy
            })
    return pd.DataFrame(data)

# --- 2. TRAIN MODEL ---
print("⏳ Training AI Model...")
df = generate_mock_data()
X = df[['day_of_week', 'hour']]
y = df['occupancy_rate']

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)
print("✅ Model Trained Successfully!")

# --- 3. ENDPOINT A: CURRENT PREDICTION (For the Popup) ---
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        day_of_week = data.get('dayOfWeek')
        hour = data.get('hour')
        total_slots = data.get('totalSlots', 100)

        prediction_input = pd.DataFrame([[day_of_week, hour]], columns=['day_of_week', 'hour'])
        predicted_occupancy = model.predict(prediction_input)[0]
        
        occupied_slots = int(predicted_occupancy * total_slots)
        free_slots = max(0, total_slots - occupied_slots)
        
        if predicted_occupancy > 0.8:
            crowd_level, color, message = "High", "red", "⚠️ Very busy!"
        elif predicted_occupancy > 0.5:
            crowd_level, color, message = "Medium", "yellow", "🚗 Moderate traffic."
        else:
            crowd_level, color, message = "Low", "green", "✅ Plenty of space available!"

        return jsonify({
            'success': True,
            'predictedFreeSlots': free_slots,
            'predictedOccupancy': round(predicted_occupancy * 100),
            'crowdLevel': crowd_level,
            'color': color,
            'suggestion': message
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# --- 4. ENDPOINT B: FUTURE FORECAST (For the Graph) ---
@app.route('/predict_future', methods=['POST'])
def predict_future():
    try:
        data = request.json
        date_str = data.get('date') 
        total_slots = data.get('totalSlots', 100)

        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        day_of_week = date_obj.weekday()
        
        future_forecast = []
        for h in range(8, 22):
            pred_input = pd.DataFrame([[day_of_week, h]], columns=['day_of_week', 'hour'])
            pred_occ = model.predict(pred_input)[0]
            
            future_forecast.append({
                "hour": f"{h}:00",
                "occupancy_percentage": round(pred_occ * 100),
                "free_slots": int(max(0, total_slots - (pred_occ * total_slots)))
            })

        return jsonify({
            'success': True,
            'forecast': future_forecast
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    # Use the port given by the cloud, or 5000 if on your laptop
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)