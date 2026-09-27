document.addEventListener('DOMContentLoaded', async () => {
    // Fetch Summary for Key Statistics
    const summary = await fetchData('/api/summary');
    const statsContainer = document.getElementById('home-stats');
    
    if (summary && !summary.error) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${summary.total_records}</div>
                <div class="stat-label">Total Records</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.avg_pm25.toFixed(2)}</div>
                <div class="stat-label">Avg PM2.5 (µg/m³)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.avg_pm10.toFixed(2)}</div>
                <div class="stat-label">Avg PM10 (µg/m³)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.max_pm25.toFixed(2)}</div>
                <div class="stat-label">Max PM2.5 (µg/m³)</div>
            </div>
        `;
    } else {
        statsContainer.innerHTML = `<div class="stat-card" style="grid-column: 1 / -1;"><p>Data not available</p></div>`;
    }

    // Fetch Analysis Data for Charts
    const analysis = await fetchData('/api/analysis');
    
    if (analysis && !analysis.error) {
        // Chart configuration options
        const scatterOptions = {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { title: { display: true } }, y: { title: { display: true, text: 'PM2.5' } } }
        };

        // 1. Distance vs PM2.5
        new Chart(document.getElementById('chart-distance'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PM2.5',
                    data: analysis.distance_pm25,
                    backgroundColor: 'rgba(43, 122, 120, 0.6)'
                }]
            },
            options: { ...scatterOptions, scales: { x: { title: { display: true, text: 'Distance (m)' } }, y: { title: { display: true, text: 'PM2.5' } } } }
        });

        // 2. Traffic vs PM2.5
        new Chart(document.getElementById('chart-traffic'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PM2.5',
                    data: analysis.traffic_pm25,
                    backgroundColor: 'rgba(58, 175, 169, 0.6)'
                }]
            },
            options: { ...scatterOptions, scales: { x: { title: { display: true, text: 'Traffic (vph)' } }, y: { title: { display: true, text: 'PM2.5' } } } }
        });

        // 3. Wind vs PM2.5
        new Chart(document.getElementById('chart-wind'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PM2.5',
                    data: analysis.wind_pm25,
                    backgroundColor: 'rgba(23, 37, 42, 0.6)'
                }]
            },
            options: { ...scatterOptions, scales: { x: { title: { display: true, text: 'Wind Speed (km/h)' } }, y: { title: { display: true, text: 'PM2.5' } } } }
        });

        // 4. PM2.5 vs PM10
        new Chart(document.getElementById('chart-pm'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PM10 vs PM2.5',
                    data: analysis.pm25_pm10,
                    backgroundColor: 'rgba(43, 122, 120, 0.8)'
                }]
            },
            options: { ...scatterOptions, scales: { x: { title: { display: true, text: 'PM2.5' } }, y: { title: { display: true, text: 'PM10' } } } }
        });

        // 5. Distribution (Histogram approximate using bar chart)
        // Adjust bins for labels
        const labels = analysis.pm25_dist.bins.slice(0, -1).map((b, i) => `${b.toFixed(1)} - ${analysis.pm25_dist.bins[i+1].toFixed(1)}`);
        
        new Chart(document.getElementById('chart-dist'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frequency',
                    data: analysis.pm25_dist.counts,
                    backgroundColor: 'rgba(58, 175, 169, 0.8)'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { title: { display: true, text: 'PM2.5 Range' } }, y: { title: { display: true, text: 'Count' } } }
            }
        });

    } else {
        document.querySelectorAll('canvas').forEach(canvas => {
            const container = canvas.parentElement;
            container.innerHTML = `<h3>${container.querySelector('h3').innerText}</h3><p class="text-center" style="padding:40px;">Data not available</p>`;
        });
    }
});
