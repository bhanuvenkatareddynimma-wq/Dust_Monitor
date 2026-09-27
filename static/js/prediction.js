document.addEventListener('DOMContentLoaded', async () => {
    
    // Load Model Metrics
    const metricsContainer = document.getElementById('metrics-container');
    const metrics = await fetchData('/api/model-performance');
    
    if (metrics && !metrics.error) {
        metricsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${metrics.pm25.mae}</div>
                <div class="stat-label">PM2.5 MAE</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${metrics.pm25.rmse}</div>
                <div class="stat-label">PM2.5 RMSE</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${metrics.pm25.r2}</div>
                <div class="stat-label">PM2.5 R² Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${metrics.pm10.mae}</div>
                <div class="stat-label">PM10 MAE</div>
            </div>
        `;
    } else {
        metricsContainer.innerHTML = `<div class="stat-card" style="grid-column: 1/-1;"><p>Model performance not available</p></div>`;
    }
    
    // Prediction Form Submit
    const form = document.getElementById('predictionForm');
    const resultContainer = document.getElementById('resultContainer');
    const loadingContainer = document.getElementById('loadingContainer');
    const initialContainer = document.getElementById('initialContainer');
    const errorContainer = document.getElementById('errorContainer');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        initialContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        loadingContainer.style.display = 'flex';
        
        const data = {
            Distance_from_Road_m: parseFloat(document.getElementById('dist').value),
            Traffic_Density_vph: parseFloat(document.getElementById('traffic').value),
            Road_Type: document.getElementById('road').value,
            Wind_Speed_kmh: parseFloat(document.getElementById('wind').value),
            Humidity_pct: parseFloat(document.getElementById('humidity').value),
            Construction_Activity: document.getElementById('construction').value,
            Vegetation_pct: parseFloat(document.getElementById('veg').value)
        };
        
        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            loadingContainer.style.display = 'none';
            
            if (response.ok && !result.error) {
                document.getElementById('res-pm25').textContent = result.pm25;
                document.getElementById('res-pm10').textContent = result.pm10;
                
                const statusEl = document.getElementById('res-status');
                statusEl.textContent = result.status;
                
                // Color code status and set advice
                const adviceEl = document.getElementById('res-advice');
                const adviceContainer = document.getElementById('careAdviceContainer');
                
                if (result.status === 'Good') {
                    statusEl.style.color = '#28a745';
                    adviceEl.innerHTML = 'Ideal air quality. It is a great time to open windows and exercise outdoors.';
                    adviceContainer.style.borderLeftColor = '#28a745';
                }
                else if (result.status === 'Moderate') {
                    statusEl.style.color = '#ffc107';
                    adviceEl.innerHTML = 'Acceptable air quality. Unusually sensitive people should consider reducing prolonged outdoor exertion.';
                    adviceContainer.style.borderLeftColor = '#ffc107';
                }
                else if (result.status === 'Unhealthy for Sensitive Groups') {
                    statusEl.style.color = '#fd7e14';
                    adviceEl.innerHTML = 'Members of sensitive groups may experience health effects. Keep windows closed and consider using an air purifier.';
                    adviceContainer.style.borderLeftColor = '#fd7e14';
                }
                else {
                    statusEl.style.color = '#dc3545';
                    adviceEl.innerHTML = 'Health alert! Everyone may begin to experience health effects. Keep all windows closed, avoid outdoor activities, and wear a mask if you must go out.';
                    adviceContainer.style.borderLeftColor = '#dc3545';
                }
                
                adviceContainer.style.display = 'block';
                resultContainer.style.display = 'flex';
            } else {
                errorContainer.style.display = 'flex';
                errorContainer.innerHTML = `<p>${result.error || 'Prediction model not available'}</p>`;
            }
        } catch (error) {
            loadingContainer.style.display = 'none';
            errorContainer.style.display = 'flex';
        }
    });
});
