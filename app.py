from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import json
import os

app = Flask(__name__)
CORS(app)

# Load data and models on startup
try:
    df = pd.read_csv('data/dust_dataset.csv')
    model_pm25 = joblib.load('models/model_pm25.joblib')
    model_pm10 = joblib.load('models/model_pm10.joblib')
    with open('models/metrics.json', 'r') as f:
        metrics = json.load(f)
except Exception as e:
    print(f"Error loading models or data: {e}")
    df = None
    model_pm25 = None
    model_pm10 = None
    metrics = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<page>.html')
def pages(page):
    return render_template(f'{page}.html')

@app.route('/api/summary')
def api_summary():
    if df is None:
        return jsonify({'error': 'Data not available'}), 404
        
    summary = {
        'total_records': int(len(df)),
        'avg_pm25': float(df['PM2_5'].mean()),
        'avg_pm10': float(df['PM10'].mean()),
        'max_pm25': float(df['PM2_5'].max())
    }
    return jsonify(summary)

@app.route('/api/dataset')
def api_dataset():
    if df is None:
        return jsonify({'error': 'Data not available'}), 404
    
    # Get pagination args
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    
    start = (page - 1) * per_page
    end = start + per_page
    
    data = df.iloc[start:end].to_dict(orient='records')
    
    return jsonify({
        'data': data,
        'total': len(df),
        'page': page,
        'per_page': per_page
    })

@app.route('/api/analysis')
def api_analysis():
    if df is None:
        return jsonify({'error': 'Data not available'}), 404
        
    # Sample data for charts to avoid large payload
    sample_df = df.sample(n=min(300, len(df)), random_state=42)
    
    # Distance vs PM25
    distance_pm25 = [{'x': float(row['Distance_from_Road_m']), 'y': float(row['PM2_5'])} for _, row in sample_df.iterrows()]
    
    # Traffic vs PM25
    traffic_pm25 = [{'x': float(row['Traffic_Density_vph']), 'y': float(row['PM2_5'])} for _, row in sample_df.iterrows()]
    
    # Wind Speed vs PM25
    wind_pm25 = [{'x': float(row['Wind_Speed_kmh']), 'y': float(row['PM2_5'])} for _, row in sample_df.iterrows()]
    
    # PM2.5 vs PM10
    pm25_pm10 = [{'x': float(row['PM2_5']), 'y': float(row['PM10'])} for _, row in sample_df.iterrows()]
    
    # Distribution of PM2.5 (histogram data)
    pm25_hist, pm25_bins = np.histogram(df['PM2_5'].dropna(), bins=10)
    pm25_dist = {'counts': pm25_hist.tolist(), 'bins': pm25_bins.tolist()}
    
    pm10_hist, pm10_bins = np.histogram(df['PM10'].dropna(), bins=10)
    pm10_dist = {'counts': pm10_hist.tolist(), 'bins': pm10_bins.tolist()}
    
    return jsonify({
        'distance_pm25': distance_pm25,
        'traffic_pm25': traffic_pm25,
        'wind_pm25': wind_pm25,
        'pm25_pm10': pm25_pm10,
        'pm25_dist': pm25_dist,
        'pm10_dist': pm10_dist
    })

@app.route('/api/model-performance')
def api_model_performance():
    if metrics is None:
        return jsonify({'error': 'Model performance not available'}), 404
    return jsonify(metrics)

@app.route('/api/predict', methods=['POST'])
def api_predict():
    if model_pm25 is None or model_pm10 is None:
        return jsonify({'error': 'Prediction model not available'}), 404
        
    try:
        data = request.json
        input_df = pd.DataFrame([data])
        
        # Ensure correct datatypes
        input_df['Distance_from_Road_m'] = input_df['Distance_from_Road_m'].astype(float)
        input_df['Traffic_Density_vph'] = input_df['Traffic_Density_vph'].astype(float)
        input_df['Wind_Speed_kmh'] = input_df['Wind_Speed_kmh'].astype(float)
        input_df['Humidity_pct'] = input_df['Humidity_pct'].astype(float)
        input_df['Vegetation_pct'] = input_df['Vegetation_pct'].astype(float)
        
        pred_pm25 = float(model_pm25.predict(input_df)[0])
        pred_pm10 = float(model_pm10.predict(input_df)[0])
        
        # Determine status
        if pred_pm25 <= 12:
            status = 'Good'
        elif pred_pm25 <= 35.4:
            status = 'Moderate'
        elif pred_pm25 <= 55.4:
            status = 'Unhealthy for Sensitive Groups'
        elif pred_pm25 <= 150.4:
            status = 'Unhealthy'
        else:
            status = 'Very Unhealthy / Hazardous'
            
        return jsonify({
            'pm25': round(pred_pm25, 2),
            'pm10': round(pred_pm10, 2),
            'status': status
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=True
    )
