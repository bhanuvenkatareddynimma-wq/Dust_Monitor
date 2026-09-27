document.addEventListener('DOMContentLoaded', async () => {
    // 1. Stats
    const summary = await fetchData('/api/summary');
    const statsContainer = document.getElementById('dash-stats');
    
    if (summary && !summary.error) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${summary.total_records}</div>
                <div class="stat-label">Total Records</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.avg_pm25.toFixed(2)}</div>
                <div class="stat-label">Average PM2.5</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.avg_pm10.toFixed(2)}</div>
                <div class="stat-label">Average PM10</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.max_pm25.toFixed(2)}</div>
                <div class="stat-label">Maximum PM2.5</div>
            </div>
        `;
    } else {
        statsContainer.innerHTML = `<div class="stat-card" style="grid-column: 1/-1;"><p>Data not available</p></div>`;
    }
    
    // 2. Charts
    const analysis = await fetchData('/api/analysis');
    
    if (analysis && !analysis.error) {
        const scatterOptions = {
            responsive: true,
            plugins: { legend: { display: false } }
        };

        const labels25 = analysis.pm25_dist.bins.slice(0, -1).map((b, i) => `${b.toFixed(0)}-${analysis.pm25_dist.bins[i+1].toFixed(0)}`);
        new Chart(document.getElementById('dash-dist25'), {
            type: 'bar',
            data: { labels: labels25, datasets: [{ data: analysis.pm25_dist.counts, backgroundColor: 'rgba(58, 175, 169, 0.8)' }] },
            options: scatterOptions
        });

        const labels10 = analysis.pm10_dist.bins.slice(0, -1).map((b, i) => `${b.toFixed(0)}-${analysis.pm10_dist.bins[i+1].toFixed(0)}`);
        new Chart(document.getElementById('dash-dist10'), {
            type: 'bar',
            data: { labels: labels10, datasets: [{ data: analysis.pm10_dist.counts, backgroundColor: 'rgba(23, 37, 42, 0.8)' }] },
            options: scatterOptions
        });

        new Chart(document.getElementById('dash-dist'), {
            type: 'scatter',
            data: { datasets: [{ data: analysis.distance_pm25, backgroundColor: 'rgba(43, 122, 120, 0.6)' }] },
            options: scatterOptions
        });

        new Chart(document.getElementById('dash-traffic'), {
            type: 'scatter',
            data: { datasets: [{ data: analysis.traffic_pm25, backgroundColor: 'rgba(43, 122, 120, 0.6)' }] },
            options: scatterOptions
        });
    }
    
    // 3. Table
    const res = await fetchData(`/api/dataset?page=1&per_page=10`);
    const tableContainer = document.getElementById('dash-table-container');
    
    if (res && !res.error) {
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Distance</th>
                        <th>Traffic</th>
                        <th>Construction</th>
                        <th>PM2.5</th>
                        <th>PM10</th>
                    </tr>
                </thead>
                <tbody>
        `;
        res.data.forEach(row => {
            html += `
                <tr>
                    <td>${row.Distance_from_Road_m} m</td>
                    <td>${row.Traffic_Density_vph}</td>
                    <td>${row.Construction_Activity}</td>
                    <td class="text-green" style="font-weight: bold;">${row.PM2_5}</td>
                    <td class="text-green" style="font-weight: bold;">${row.PM10}</td>
                </tr>
            `;
        });
        html += `</tbody></table>`;
        tableContainer.innerHTML = html;
    } else {
        tableContainer.innerHTML = `<p class="text-center" style="padding: 20px;">Dataset not connected</p>`;
    }
});
