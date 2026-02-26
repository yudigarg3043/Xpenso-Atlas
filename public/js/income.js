document.addEventListener('DOMContentLoaded', async function () {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/';
        return;
    }

    document.getElementById('userName').textContent = user.fullName;

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // 👉 Close sidebar on outside click (only for small screens)
    document.addEventListener('click', function (event) {
        if (
            window.innerWidth <= 991.98 &&               // Only on mobile
            sidebar.classList.contains('active') &&      // Sidebar is open
            !sidebar.contains(event.target) &&           // Click is outside sidebar
            !menuToggle.contains(event.target)           // Click is not the toggle button
        ) {
            sidebar.classList.remove('active');
        }
    });

    // 🟢 Fetch expenses and render the doughnut chart
    try {
        const res = await fetch('/api/incomes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const incomes = await res.json();

        const categoryTotals = {};
        incomes.forEach(exp => {
            const category = exp.category;
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += exp.amount;
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        const colors = labels.map((_, i) => `hsl(${(i * 60) % 360}, 70%, 60%)`);

        const ctx = document.getElementById('incomeChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#4caf50',
                        '#ff9800',
                        '#2196f3',
                        '#9c27b0',
                        '#f44336',
                        '#607d8b'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        position: 'bottom',
                        text: 'Earnings By Category'
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            boxWidth: 12
                        }
                    }
                },
                cutout: '70%'
            }
        });
    } catch (err) {
        console.error('Error loading chart:', err);
    }

    // 🟢 Fetch and display recent Earnings (Top 5 by date)
    async function loadRecentEarnings() {
        try {
            const res = await fetch('/api/income/recent', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data = await res.json();

            // Sort by date descending
            data.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Take the first 5
            const recentFive = data.slice(0, 5);

            const list = document.querySelector('.transaction-list');
            list.innerHTML = ''; // Clear old list

            recentFive.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('transaction-item');
                li.innerHTML = `
                <div class="transaction-icon income">
                    <i class="${item.category === 'Salary' ? 'fas fa-money-check' : item.category === 'Stock Investment' ? 'fas fa-money-bill-trend-up' : item.category === 'Mutual Funds' ? 'fas fa-money-bill' : item.category === 'Dividend' ? 'fas fa-coins' : 'fas fa-wallet'}"></i>
                </div>
                <div class="transaction-details">
                    <span class="transaction-title">${item.category}</span>
                    <span class="transaction-date">${new Date(item.date).toLocaleDateString()}</span>
                </div>
                <span class="transaction-amount income">+₹${item.amount.toFixed(2)}</span>
            `;
                list.appendChild(li);
            });
        } catch (err) {
            console.error('Error loading transactions:', err);
        }
    }

    loadRecentEarnings();

    async function loadAllEarnings() {
        try {
            const res = await fetch('/api/incomes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to fetch earnings.');
            }

            const earnings = await res.json();

            const modalContent = document.querySelector('.modal-content .transaction-list');
            modalContent.innerHTML = ''; // Clear previous content

            earnings.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('transaction-item');
                li.innerHTML = `
                <div class="transaction-icon income">
                    <i class="${item.category === 'Salary' ? 'fas fa-money-check' : item.category === 'Stock Investment' ? 'fas fa-money-bill-trend-up' : item.category === 'Mutual Funds' ? 'fas fa-money-bill' : item.category === 'Dividend' ? 'fas fa-coins' : 'fas fa-wallet'}"></i>
                </div>
                <div class="transaction-details">
                    <span class="transaction-title">${item.category}</span>
                    <span class="transaction-date">${new Date(item.date).toLocaleDateString()}</span>
                </div>
                <span class="transaction-amount income">+₹${item.amount.toFixed(2)}</span>
            `;
                modalContent.appendChild(li);
            });
        } catch (err) {
            console.error('Error loading all earnings:', err);
            alert('Failed to load earnings. Please try again later.');
        }
    }
    document.querySelector('.modal-open').addEventListener('click', function () {
        loadAllEarnings();
    });


    fetch('/api/incomes/total-per-category', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('status');

            data.forEach(item => {
                const { category, spent, total, percentage } = item;

                const percentValue = parseFloat(percentage);
                const progressClass = percentValue < 70 ? 'bg-success' :
                    percentValue < 90 ? 'bg-warning' : 'bg-danger';

                const budgetItemHTML = `
                    <div class="budget-item mb-3">
                        <div class="budget-info d-flex justify-content-between">
                            <span class="budget-category">${category}</span>
                            <span class="budget-progress">₹${spent}/₹${total} (${percentage}%)</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar ${progressClass}" role="progressbar" style="width: ${percentValue}%"></div>
                        </div>
                    </div>
                `;

                container.insertAdjacentHTML('beforeend', budgetItemHTML);
            });
        })
        .catch(error => {
            console.error('Error fetching budget data:', error.message);
        });


});

document.addEventListener('DOMContentLoaded', function () {
    // Download Excel button
    document.getElementById('downloadExcelBtn').addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('token');

            const res = await fetch('/api/incomes/export/excel', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const blob = await res.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Incomes.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download Excel file:', err);
        }
    });

    // Adding Income
    document.getElementById('incomeForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        const incomeData = { description, amount, category, date };

        const token = localStorage.getItem('token');

        try {
            const res = await fetch('/api/income', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(incomeData)
            });

            const result = await res.json();

            if (res.status === 201) {
                alert('Income added successfully!');
                document.getElementById('incomeForm').reset();
                location.reload();
            } else {
                alert(result.message || 'Failed to add income.');
            }
        } catch (err) {
            console.error('Error:', err);
            alert('An error occurred while adding the income.');
        }
    });

    // Theme toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeToggleBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    });

    // Modal
    const modal = document.getElementById('transactionModal');
    const openBtn = document.querySelector('.modal-open');
    const closeBtn = document.getElementById('closeModal');

    openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
