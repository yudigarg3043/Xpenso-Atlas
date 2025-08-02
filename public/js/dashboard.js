document.addEventListener('DOMContentLoaded', function() {
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
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // 👉 Close sidebar on outside click (only for small screens)
    document.addEventListener('click', function(event) {
        if (
            window.innerWidth <= 991.98 &&               // Only on mobile
            sidebar.classList.contains('active') &&      // Sidebar is open
            !sidebar.contains(event.target) &&           // Click is outside sidebar
            !menuToggle.contains(event.target)           // Click is not the toggle button
        ) {
            sidebar.classList.remove('active');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    });

    // 🟢 Fetch expenses and render the doughnut chart
    async function loadExpChart(){
        try {
            const res = await fetch('/api/expenses', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const expenses = await res.json();
    
            const categoryTotals = {};
            expenses.forEach(exp => {
                const category = exp.category;
                if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                }
                categoryTotals[category] += exp.amount;
            });
    
            const labels = Object.keys(categoryTotals);
            const data = Object.values(categoryTotals);
    
            const colors = labels.map((_, i) => `hsl(${(i * 60) % 360}, 70%, 60%)`);
    
            const ctx = document.getElementById('expenseChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors,
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
                                    text: 'Expenses By Category'
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
    }
    loadExpChart();

    // 🟢 Fetch earnings and render the doughnut chart
    async function loadIncChart(){
        try {
            const res = await fetch('/api/incomes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const earnings = await res.json();
    
            const categoryTotals = {};
            earnings.forEach(exp => {
                const category = exp.category;
                if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                }
                categoryTotals[category] += exp.amount;
            });
    
            const labels = Object.keys(categoryTotals);
            const data = Object.values(categoryTotals);
    
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
    }
    loadIncChart();
    
    // 🟢 Fetch and display recent Transactions (Top 5 by date)
async function loadRecentTransaction() {
    try {
        const res = await fetch('/api/transaction/recent', {
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
            
            const typeClass = item.type === 'expense' ? 'expense' : 'income';
            const iconClass = item.type === 'income'
                ? (item.category === 'Salary' ? 'fas fa-money-check' :
                    item.category === 'Stock Investment' ? 'fas fa-money-bill-trend-up' : 
                    item.category === 'Mutual Funds' ? 'fas fa-money-bill' : 
                    item.category === 'Dividend' ? 'fas fa-coins' : 
                    'fas fa-wallet')
                : (item.category === 'Food' ? 'fas fa-utensils' : 
                    item.category === 'Transport' ? 'fas fa-gas-pump' : 
                    item.category === 'Entertainment' ? 'fas fa-face-smile' : 
                    item.category === 'Bills' ? 'fas fa-receipt' : 
                    item.category === 'Shopping' ? 'fas fa-shopping-cart' : 
                    'fas fa-indian-rupee-sign');
        
            const amountPrefix = item.type === 'expense' ? '-' : '+';
        
            li.innerHTML = `
                <div class="transaction-icon ${typeClass}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="transaction-details">
                    <span class="transaction-title">${item.category}</span>
                    <span class="transaction-date">${new Date(item.date).toLocaleDateString()}</span>
                </div>
                <span class="transaction-amount ${typeClass}">${amountPrefix}₹${item.amount.toFixed(2)}</span>
            `;
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Error loading transactions:', err);
    }
}
    loadRecentTransaction();
async function loadMonthlySummary() {
    try {
        const res = await fetch('/api/transaction/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        const { totalIncome, totalExpense, savings } = data;

        const incomeElem = document.querySelector('.stat-value.income');
        const expenseElem = document.querySelector('.stat-value.expenses');
        const savingsElem = document.querySelector('.stat-value.savings');

        document.querySelector('.stat-value.income').textContent = `₹${totalIncome.toFixed(2)}`;
        document.querySelector('.stat-value.expenses').textContent = `₹${totalExpense.toFixed(2)}`;

        const savingsChangeElem = document.querySelector('.stat-change.positive, .stat-change.negative');
        const savingsValueElem = document.querySelector('.stat-value.savings');
        const savingsLabelElem = document.querySelector('.stat-label.savings');

        const savingsPercentage = ((totalIncome - totalExpense) / totalIncome) * 100;

        if (savings >= 0) {
            savingsValueElem.textContent = `₹${savings.toFixed(2)}`;
            savingsChangeElem.textContent = `+${savingsPercentage.toFixed(1)}%`;
            savingsChangeElem.classList.add('positive');
        } else {
            savingsLabelElem.textContent = 'Debt';
            savingsValueElem.textContent = `₹${Math.abs(savings).toFixed(2)}`;
            savingsChangeElem.textContent = `${savingsPercentage.toFixed(1)}%`
            savingsChangeElem.classList.remove('positive');
            savingsChangeElem.classList.add('negative');
        }

    } catch (err) {
        console.error('Error loading monthly summary:', err);
    }
}

loadMonthlySummary();


// LOAD TRANSACTIONS IN POPUP   
    const modal = document.getElementById('transactionModal');
    const openBtn = document.querySelector('.modal-open');
    const closeBtn = document.getElementById('closeModal');

    // Function to load all transactions (income and expense)
    async function loadAllTransactions() {
        try {
            const res = await fetch('/api/transaction/recent', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch transactions.');
            }

            const transactions = await res.json();

            // Sort by date descending
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            const transactionList = document.querySelector('.all-transactions-list'); // Ensure this container exists in your modal
            transactionList.innerHTML = ''; // Clear previous content

            transactions.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('transaction-item');

                const typeClass = item.type === 'expense' ? 'expense' : 'income';
                const iconClass = item.type === 'income'
                    ? (item.category === 'Salary' ? 'fas fa-money-check' :
                        item.category === 'Stock Investment' ? 'fas fa-money-bill-trend-up' :
                        item.category === 'Mutual Funds' ? 'fas fa-money-bill' :
                        item.category === 'Dividend' ? 'fas fa-coins' :
                        'fas fa-wallet')
                    : (item.category === 'Food' ? 'fas fa-utensils' :
                        item.category === 'Transport' ? 'fas fa-gas-pump' :
                        item.category === 'Entertainment' ? 'fas fa-face-smile' :
                        item.category === 'Bills' ? 'fas fa-receipt' :
                        item.category === 'Shopping' ? 'fas fa-shopping-cart' :
                        'fas fa-indian-rupee-sign');

                const amountPrefix = item.type === 'expense' ? '-' : '+';

                li.innerHTML = `
                    <div class="transaction-icon ${typeClass}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="transaction-details">
                        <span class="transaction-title">${item.category}</span>
                        <span class="transaction-date">${new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <span class="transaction-amount ${typeClass}">${amountPrefix}₹${item.amount.toFixed(2)}</span>
                `;
                transactionList.appendChild(li);
            });
        } catch (err) {
            console.error('Error loading transactions:', err);
            alert('Failed to load transactions. Please try again later.');
        }
    }

    async function fetchTopCategories() {
        try {
            const response = await fetch('/api/top-categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
          const data = await response.json();
    
          const container = document.getElementById('top-categories');
          container.innerHTML = ''; // Clear any existing content
    
          if (data.length === 0) {
            container.innerHTML = '<p>No data available.</p>';
            return;
          }
    
          data.forEach(item => {
            const categoryElement = document.createElement('div');
            const iconClass = (item._id === 'Food' ? 'fas fa-utensils' : 
                item._id === 'Transport' ? 'fas fa-gas-pump' : 
                item._id === 'Entertainment' ? 'fas fa-face-smile' : 
                item._id === 'Bills' ? 'fas fa-receipt' : 
                item._id === 'Shopping' ? 'fas fa-shopping-cart' : 
                'fas fa-indian-rupee-sign');
            categoryElement.className = 'category-item';
            // categoryElement.innerHTML = `
            //   <strong>${item._id}</strong>: ₹${item.total.toFixed(2)}
            // `;
            categoryElement.innerHTML = `
                <div class="transaction-icon expense">
                    <i class="${iconClass}"></i>
                </div>
                <div class="transaction-details">
                    <span class="transaction-title">${item._id}</span>
                </div>
                <span class="transaction-amount">₹${item.total.toFixed(2)}</span>
            `;
            container.appendChild(categoryElement);
          });
        } catch (err) {
          console.error('Error fetching top categories:', err);
          document.getElementById('top-categories').innerHTML = '<p>Error loading data.</p>';
        }
    }

    fetchTopCategories();
    
    // Open modal and load transactions
    openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        modal.style.display = 'flex'; // Flex for centering
        loadAllTransactions(); // Load transactions when modal is opened
    });

    // Close modal
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

});

document.getElementById('downloadExcelBtn').addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('token'); // if you use JWT auth

        const res = await fetch('/api/transaction/export/excel', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const blob = await res.blob();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Transactions.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to download Excel file:', err);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const themeToggleBtn = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme');

    // Apply the saved theme on page load
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon" style="color: black;"></i>';
    }

    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeToggleBtn.innerHTML = isLight
            ? '<i class="fas fa-moon" style="color: black;"></i>'
            : '<i class="fas fa-sun" style="color: white;"></i>';
    });
});
