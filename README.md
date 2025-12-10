# 🚗 SmartPark - AI-Powered Parking Finder

**SmartPark** is an intelligent parking management system that uses Machine Learning to predict parking availability. It helps users find open spots in real-time and forecasts future congestion trends to reduce wait times and fuel consumption.

![Project Status](https://img.shields.io/badge/Status-In%20Development-green)
![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Python%20AI-blue)

## 🌟 Key Features

* **Real-Time Availability:** View current available slots for multiple parking locations.
* **🤖 AI Predictions:** A Random Forest Regressor model (Python/Scikit-Learn) predicts occupancy rates based on hour and day of the week.
* **📅 Future Forecasting:** Interactive bar charts allow users to check parking crowd levels for specific future dates.
* **Smart Dashboard:** Visual indicators (Green/Yellow/Red) for "Low", "Medium", and "High" traffic.
* **Booking System:** (In Progress) Reserve spots in advance.

## 🛠️ Tech Stack

### **Frontend**
* **React.js (Vite):** Fast, modern UI library.
* **Tailwind CSS:** For responsive and beautiful styling.
* **Recharts:** For rendering the interactive prediction graphs.
* **Lucide React:** For modern iconography.

### **Backend & AI**
* **Python (Flask):** Serves the ML model as a REST API.
* **Scikit-Learn:** Uses a **Random Forest Regressor** to train on historical parking data.
* **Pandas & NumPy:** For data processing and mock data generation.



## 🚀 How to Run the Project Locally

This project consists of two parts: the **React Frontend** and the **Python ML Server**. You need to run both terminals simultaneously.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/parking-finder.git](https://github.com/YOUR_USERNAME/parking-finder.git)
cd parking-finder