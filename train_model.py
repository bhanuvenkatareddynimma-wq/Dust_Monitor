import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import json
import os

def train_and_evaluate():
    # Load dataset
    df = pd.read_csv('data/dust_dataset.csv')
    
    # Features and targets
    X = df.drop(columns=['PM2_5', 'PM10'])
    y_pm25 = df['PM2_5']
    y_pm10 = df['PM10']
    
    # Preprocessing
    numeric_features = ['Distance_from_Road_m', 'Traffic_Density_vph', 'Wind_Speed_kmh', 'Humidity_pct', 'Vegetation_pct']
    categorical_features = ['Road_Type', 'Construction_Activity']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(drop='first'), categorical_features)
        ])
    
    # Create models for both PM2.5 and PM10
    model_pm25 = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    model_pm10 = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    # Train-test split
    X_train, X_test, y_train_25, y_test_25 = train_test_split(X, y_pm25, test_size=0.2, random_state=42)
    _, _, y_train_10, y_test_10 = train_test_split(X, y_pm10, test_size=0.2, random_state=42)
    
    # Train
    print("Training PM2.5 model...")
    model_pm25.fit(X_train, y_train_25)
    
    print("Training PM10 model...")
    model_pm10.fit(X_train, y_train_10)
    
    # Evaluate
    pred_25 = model_pm25.predict(X_test)
    pred_10 = model_pm10.predict(X_test)
    
    metrics = {
        'pm25': {
            'mae': round(mean_absolute_error(y_test_25, pred_25), 2),
            'mse': round(mean_squared_error(y_test_25, pred_25), 2),
            'rmse': round(np.sqrt(mean_squared_error(y_test_25, pred_25)), 2),
            'r2': round(r2_score(y_test_25, pred_25), 3)
        },
        'pm10': {
            'mae': round(mean_absolute_error(y_test_10, pred_10), 2),
            'mse': round(mean_squared_error(y_test_10, pred_10), 2),
            'rmse': round(np.sqrt(mean_squared_error(y_test_10, pred_10)), 2),
            'r2': round(r2_score(y_test_10, pred_10), 3)
        }
    }
    
    # Save models
    os.makedirs('models', exist_ok=True)
    joblib.dump(model_pm25, 'models/model_pm25.joblib')
    joblib.dump(model_pm10, 'models/model_pm10.joblib')
    
    # Save metrics
    with open('models/metrics.json', 'w') as f:
        json.dump(metrics, f)
        
    print("Models trained and saved to models/")
    print(f"Metrics: {metrics}")

if __name__ == '__main__':
    train_and_evaluate()
