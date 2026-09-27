import pandas as pd
import numpy as np

def generate_data(num_samples=1000):
    np.random.seed(42)
    
    # Independent variables
    distance_from_road = np.random.uniform(5, 500, num_samples) # meters
    traffic_density = np.random.uniform(100, 5000, num_samples) # vehicles/hour
    road_type = np.random.choice(['Highway', 'Arterial', 'Residential'], num_samples, p=[0.2, 0.5, 0.3])
    wind_speed = np.random.uniform(0, 30, num_samples) # km/h
    humidity = np.random.uniform(30, 90, num_samples) # percentage
    construction_activity = np.random.choice(['Low', 'Medium', 'High'], num_samples, p=[0.6, 0.3, 0.1])
    vegetation = np.random.uniform(0, 100, num_samples) # percentage coverage
    
    # Base PM levels
    base_pm25 = 15.0
    base_pm10 = 25.0
    
    # Calculate PM levels with relationships
    # Distance reduces PM
    # Traffic increases PM
    # Wind disperses PM (lowers it)
    # Humidity can weigh down dust but also combine with aerosols
    # Construction increases PM heavily
    # Vegetation filters PM (lowers it)
    
    pm25 = base_pm25 \
           - (np.log1p(distance_from_road) * 2) \
           + (traffic_density / 500) \
           - (wind_speed * 0.3) \
           + (humidity * 0.05) \
           - (vegetation * 0.1)
           
    # Add construction effect
    construction_multiplier_25 = {'Low': 0, 'Medium': 15, 'High': 35}
    pm25 += np.array([construction_multiplier_25[c] for c in construction_activity])
    
    # Road type effect
    road_multiplier_25 = {'Highway': 10, 'Arterial': 5, 'Residential': 0}
    pm25 += np.array([road_multiplier_25[r] for r in road_type])
    
    # Add noise
    pm25 += np.random.normal(0, 3, num_samples)
    pm25 = np.maximum(pm25, 2.0) # minimum threshold
    
    # PM10 is generally higher and more affected by construction/road dust
    pm10 = pm25 * 1.5 + (np.array([construction_multiplier_25[c] for c in construction_activity]) * 1.2)
    pm10 += np.random.normal(0, 5, num_samples)
    pm10 = np.maximum(pm10, 5.0)
    
    df = pd.DataFrame({
        'Distance_from_Road_m': np.round(distance_from_road, 1),
        'Traffic_Density_vph': np.round(traffic_density, 0),
        'Road_Type': road_type,
        'Wind_Speed_kmh': np.round(wind_speed, 1),
        'Humidity_pct': np.round(humidity, 1),
        'Construction_Activity': construction_activity,
        'Vegetation_pct': np.round(vegetation, 1),
        'PM2_5': np.round(pm25, 2),
        'PM10': np.round(pm10, 2)
    })
    
    df.to_csv('data/dust_dataset.csv', index=False)
    print("Dataset generated and saved to data/dust_dataset.csv")

if __name__ == '__main__':
    generate_data()
