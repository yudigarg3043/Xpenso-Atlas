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
    
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Food & Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Others'],
            datasets: [{
                data: [420, 280, 150, 180, 320, 190],
                backgroundColor: [
                    '#4caf50',
                    '#ff9800',
                    '#2196f3',
                    '#9c27b0',
                    '#f44336',
                    '#607d8b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
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
});
