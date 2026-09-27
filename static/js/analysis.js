document.addEventListener('DOMContentLoaded', async () => {
    // Fetch Analysis Data for Charts
    const analysis = await fetchData('/api/analysis');
    
    if (analysis && !analysis.error) {
        // Chart configuration options
        const scatterOptions = {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { title: { display: true } }, y: { title: { display: true, text: 'PM2.5 (µg/m³)' } } }
        };

        // 1. Distance vs PM2.5
        new Chart(document.getElementById('analysis-distance'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PM2.5',
                    data: analysis.distance_pm25,
                    backgroundColor: 'rgba(43, 122, 120, 0.6)'
                }]
            },
            options: { ...scatterOptions, scales: { x: { title: { display: true, text: 'Distance from Road (m)' } }, y: scatterOptions.scales.y } }
        });

        // 2. Traffic vs PM2.5
        new Chart(document.getElementById('analysis-traffic'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PM2.5',
                    data: analysis.traffic_pm25,
                    backgroundColor: 'rgba(58, 175, 169, 0.6)'
                }]
            },
            options: { ...scatterOptions, scales: { x: { title: { display: true, text: 'Traffic Density (vph)' } }, y: scatterOptions.scales.y } }
        });

        // 3. Wind vs PM2.5
        new Chart(document.getElementById('analysis-wind'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PM2.5',
                    data: analysis.wind_pm25,
                    backgroundColor: 'rgba(23, 37, 42, 0.6)'
                }]
            },
            options: { ...scatterOptions, scales: { x: { title: { display: true, text: 'Wind Speed (km/h)' } }, y: scatterOptions.scales.y } }
        });

        // 4. PM2.5 vs PM10
        new Chart(document.getElementById('analysis-pm'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PM10',
                    data: analysis.pm25_pm10,
                    backgroundColor: 'rgba(43, 122, 120, 0.8)'
                }]
            },
            options: { ...scatterOptions, scales: { x: { title: { display: true, text: 'PM2.5 (µg/m³)' } }, y: { title: { display: true, text: 'PM10 (µg/m³)' } } } }
        });

        // 5. PM2.5 Distribution
        const labels25 = analysis.pm25_dist.bins.slice(0, -1).map((b, i) => `${b.toFixed(1)} - ${analysis.pm25_dist.bins[i+1].toFixed(1)}`);
        
        new Chart(document.getElementById('analysis-dist-25'), {
            type: 'bar',
            data: {
                labels: labels25,
                datasets: [{
                    label: 'Frequency',
                    data: analysis.pm25_dist.counts,
                    backgroundColor: 'rgba(58, 175, 169, 0.8)'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { title: { display: true, text: 'PM2.5 Range (µg/m³)' } }, y: { title: { display: true, text: 'Count' } } }
            }
        });

        // 6. PM10 Distribution
        const labels10 = analysis.pm10_dist.bins.slice(0, -1).map((b, i) => `${b.toFixed(1)} - ${analysis.pm10_dist.bins[i+1].toFixed(1)}`);
        
        new Chart(document.getElementById('analysis-dist-10'), {
            type: 'bar',
            data: {
                labels: labels10,
                datasets: [{
                    label: 'Frequency',
                    data: analysis.pm10_dist.counts,
                    backgroundColor: 'rgba(23, 37, 42, 0.8)'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { title: { display: true, text: 'PM10 Range (µg/m³)' } }, y: { title: { display: true, text: 'Count' } } }
            }
        });

    } else {
        document.querySelectorAll('canvas').forEach(canvas => {
            const container = canvas.parentElement;
            container.innerHTML = `<h3>${container.querySelector('h3').innerText}</h3><p class="text-center" style="padding:40px;">Data not available</p>`;
        });
    }
});
