document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        // Redirect to login page if not logged in
        window.location.href = '/index.html';
        return;
    }
    
    // Set user name
    document.getElementById('userName').textContent = user.fullName;
    
    // Toggle sidebar on mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/index.html';
    });
    
    // Initialize expense chart
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
            maintainAspectRatio: false,
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
    
    // Fetch and display user's transactions
    fetchTransactions();
});

// Function to fetch user transactions
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