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
    
    fetchTransactions();
});

function fetchTransactions() {
    const token = localStorage.getItem('token');
    // This would normally be a fetch request to your API
    // For demo purposes, we're using mock data
    
    // Example of how the fetch would look:
    /*
    fetch('/api/transactions', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Process and display transactions
        displayTransactions(data.transactions);
    })
    .catch(error => {
        console.error('Error fetching transactions:', error);
    });
    */
    
    // For now, we'll just use the mock data already in the HTML
}
