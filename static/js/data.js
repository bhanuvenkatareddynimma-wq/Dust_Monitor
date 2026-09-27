document.addEventListener('DOMContentLoaded', async () => {
    let currentPage = 1;
    let totalPages = 1;
    let fullData = [];
    let filteredData = [];
    const perPage = 50;

    const tableContainer = document.getElementById('table-container');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    const searchInput = document.getElementById('searchInput');

    // Load Summary
    const summary = await fetchData('/api/summary');
    if (summary && !summary.error) {
        document.getElementById('data-summary').innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${summary.total_records}</div>
                <div class="stat-label">Total Records</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">7</div>
                <div class="stat-label">Features</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">2</div>
                <div class="stat-label">Target Variables</div>
            </div>
        `;
    } else {
        document.getElementById('data-summary').innerHTML = `<div class="stat-card" style="grid-column: 1/-1;"><p>Dataset not connected</p></div>`;
        tableContainer.innerHTML = `<h3 class="text-center">Dataset not connected</h3>`;
        return;
    }

    // Since we need search/sort, it's easier to fetch all or a large chunk for the demo.
    // For this academic project, we fetch page 1 with a large size to have enough data to search client-side, 
    // or we fetch all if it's small (1000 records). Let's fetch 1000.
    const res = await fetchData(`/api/dataset?page=1&per_page=1000`);
    
    if (res && !res.error) {
        fullData = res.data;
        filteredData = [...fullData];
        totalPages = Math.ceil(filteredData.length / perPage);
        renderTable();
    } else {
        tableContainer.innerHTML = `<h3 class="text-center">Dataset not available</h3>`;
    }

    function renderTable() {
        if (filteredData.length === 0) {
            tableContainer.innerHTML = `<p class="text-center" style="padding: 20px;">No records found.</p>`;
            return;
        }

        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        const pageData = filteredData.slice(start, end);

        let html = `
            <table id="dataTable">
                <thead>
                    <tr>
                        <th>Distance (m)</th>
                        <th>Traffic (vph)</th>
                        <th>Road Type</th>
                        <th>Wind (km/h)</th>
                        <th>Humidity (%)</th>
                        <th>Construction</th>
                        <th>Vegetation (%)</th>
                        <th>PM2.5</th>
                        <th>PM10</th>
                    </tr>
                </thead>
                <tbody>
        `;

        pageData.forEach(row => {
            html += `
                <tr>
                    <td>${row.Distance_from_Road_m}</td>
                    <td>${row.Traffic_Density_vph}</td>
                    <td>${row.Road_Type}</td>
                    <td>${row.Wind_Speed_kmh}</td>
                    <td>${row.Humidity_pct}</td>
                    <td>${row.Construction_Activity}</td>
                    <td>${row.Vegetation_pct}</td>
                    <td class="text-green" style="font-weight: bold;">${row.PM2_5}</td>
                    <td class="text-green" style="font-weight: bold;">${row.PM10}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        tableContainer.innerHTML = html;

        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredData = fullData.filter(row => {
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(term)
            );
        });
        currentPage = 1;
        totalPages = Math.ceil(filteredData.length / perPage);
        renderTable();
    });
});
