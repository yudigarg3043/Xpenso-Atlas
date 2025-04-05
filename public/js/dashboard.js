// Dashboard specific JavaScript
let balanceChart;
let expensesChart;

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Format currency
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get icon for category
function getCategoryIcon(category, type) {
    const incomeIcons = {
        'Salary': 'fas fa-money-bill-wave',
        'Freelance': 'fas fa-laptop',
        'Investments': 'fas fa-chart-line',
        'Interest': 'fas fa-percentage',
        'Gifts': 'fas fa-gift',
        'Other': 'fas fa-ellipsis-h'
    };
    
    const expenseIcons = {
        'Food': 'fas fa-utensils',
        'Transport': 'fas fa-car',
        'Entertainment': 'fas fa-film',
        'Shopping': 'fas fa-shopping-bag',
        'Housing': 'fas fa-home',
        'Utilities': 'fas fa-bolt',
        'Healthcare': 'fas fa-medkit',
        'Insurance': 'fas fa-shield-alt',
        'Debt': 'fas fa-credit-card',
        'Savings': 'fas fa-piggy-bank',
        'Other': 'fas fa-ellipsis-h'
    };
    
    if (type === 'income') {
        return incomeIcons[category] || 'fas fa-ellipsis-h';
    } else {
        return expenseIcons[category] || 'fas fa-ellipsis-h';
    }
}

// Helper function to get category class
function getCategoryClass(category) {
    return category.toLowerCase();
}

// Fetch dashboard data
async function fetchDashboardData() {
    if (!checkAuth()) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showErrorMessage('Failed to load dashboard data. Please try again later.');
        return null;
    }
}

// Show error message
function showErrorMessage(message) {
    // Create error message element if it doesn't exist
    let errorElement = document.getElementById('errorMessage');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'errorMessage';
        errorElement.className = 'alert alert-danger alert-dismissible fade show';
        errorElement.innerHTML = `
            <span id="errorText"></span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.querySelector('.main-content').prepend(errorElement);
    }
    
    // Set error message
    document.getElementById('errorText').textContent = message;
    
    // Show error message
    errorElement.classList.remove('d-none');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorElement.classList.add('d-none');
    }, 5000);
}

// Render recent transactions
function renderRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    container.innerHTML = '';
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<div class="text-center py-4">No transactions found</div>';
        return;
    }
    
    transactions.forEach(transaction => {
        const isIncome = transaction.hasOwnProperty('title');
        const icon = getCategoryIcon(transaction.category);
        const date = formatDate(transaction.date);
        const amount = formatCurrency(transaction.amount);
        
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item';
        transactionEl.innerHTML = `
            <div class="transaction-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.title || transaction.category}</div>
                <div class="transaction-date">${date}</div>
            </div>
            <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '+' : '-'} ${amount}
                <i class="fas fa-chevron-right ms-2"></i>
            </div>
        `;
        
        container.appendChild(transactionEl);
    });
}

// Render expenses list
function renderExpensesList(expenses) {
    const container = document.getElementById('expensesList');
    container.innerHTML = '';
    
    if (!expenses || expenses.length === 0) {
        container.innerHTML = '<div class="text-center py-4">No expenses found</div>';
        return;
    }
    
    expenses.slice(0, 3).forEach(expense => {
        const icon = getCategoryIcon(expense.category);
        const date = formatDate(expense.date);
        const amount = formatCurrency(expense.amount);
        
        const expenseEl = document.createElement('div');
        expenseEl.className = 'transaction-item';
        expenseEl.innerHTML = `
            <div class="transaction-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${expense.title}</div>
                <div class="transaction-date">${date}</div>
            </div>
            <div class="transaction-amount expense">
                - ${amount}
                <i class="fas fa-chevron-right ms-2"></i>
            </div>
        `;
        
        container.appendChild(expenseEl);
    });
}

// Initialize balance chart
function initBalanceChart(totalIncome, totalExpense, balance) {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    
    // Set total balance in the center
    document.getElementById('totalBalance').textContent = formatCurrency(balance);
    
    // Create chart
    balanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Total Income', 'Total Expenses'],
            datasets: [{
                data: [totalIncome, totalExpense],
                backgroundColor: [
                    '#ff5722', // Income color
                    '#f44336'  // Expense color
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize expenses chart
function initExpensesChart(expenses) {
    const ctx = document.getElementById('expensesChart').getContext('2d');
    
    // Process data for chart
    const dates = [];
    const amounts = [];
    
    // Group expenses by date
    const groupedExpenses = {};
    
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!groupedExpenses[dateStr]) {
            groupedExpenses[dateStr] = 0;
        }
        
        groupedExpenses[dateStr] += expense.amount;
    });
    
    // Sort dates
    const sortedDates = Object.keys(groupedExpenses).sort();
    
    sortedDates.forEach(date => {
        const displayDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dates.push(displayDate);
        amounts.push(groupedExpenses[date]);
    });
    
    // Create chart
    expensesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Expenses',
                data: amounts,
                backgroundColor: '#7c4dff',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize dashboard
async function initDashboard() {
    if (!checkAuth()) return;
    
    // Show loading state
    document.getElementById('recentTransactions').innerHTML = `
        <div class="transaction-item skeleton">
            <div class="transaction-icon skeleton-circle"></div>
            <div class="transaction-details">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
            <div class="transaction-amount">
                <div class="skeleton-line short"></div>
            </div>
        </div>
        <div class="transaction-item skeleton">
            <div class="transaction-icon skeleton-circle"></div>
            <div class="transaction-details">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
            <div class="transaction-amount">
                <div class="skeleton-line short"></div>
            </div>
        </div>
    `;
    
    // Fetch dashboard data
    const dashboardData = await fetchDashboardData();
    
    if (!dashboardData) {
        return;
    }
    
    // Render recent transactions
    renderRecentTransactions(dashboardData.recentTransactions);
    
    // Render expenses list
    renderExpensesList(dashboardData.last30DaysExpenses);
    
    // Initialize charts
    initBalanceChart(dashboardData.totalIncome, dashboardData.totalExpense, dashboardData.balance);
    initExpensesChart(dashboardData.last30DaysExpenses);
}

// Initialize when DOM is loaded
//document.addEventListener('DOMContentLoaded', initDashboard);

// Dashboard page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!requireAuth()) return;
    
    // Initialize UI elements
    initUI();
    
    // Load dashboard data
    loadDashboardData();
    
    // Add debug logging
    console.log('Dashboard page initialized');
});

// Initialize UI elements
function initUI() {
    // Update user info in UI
    updateUserUI();
}

// Load dashboard data from server
async function loadDashboardData() {
    try {
        showLoading();
        console.log('Loading dashboard data...');
        
        const token = getToken();
        const response = await fetch('/api/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dashboard data loaded:', data);
        
        // Update UI with dashboard data
        updateDashboardUI(data);
        
        hideLoading();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data. Please try again later.');
        hideLoading();
    }
}

// Update UI with dashboard data
function updateDashboardUI(data) {
    // Update balance overview
    updateBalanceOverview(data.income || [], data.expenses || []);
    
    // Update recent transactions
    updateRecentTransactions(data.recentTransactions || []);
    
    // Update expense trends
    updateExpenseTrends(data.expenses || []);
    
    // Update recent expenses
    updateRecentExpenses(data.expenses || []);
    
    console.log('Dashboard UI updated');
}

// Update balance overview
function updateBalanceOverview(income, expenses) {
    // Calculate total income
    const totalIncome = income.reduce((total, item) => total + item.amount, 0);
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((total, item) => total + item.amount, 0);
    
    // Calculate balance
    const balance = totalIncome - totalExpenses;
    
    // Update UI elements
    document.getElementById('totalBalance').textContent = formatCurrency(balance);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(totalExpenses);
    
    // Update balance chart
    updateBalanceChart(totalIncome, totalExpenses);
    
    console.log('Balance overview updated:', { totalIncome, totalExpenses, balance });
}

// Update balance chart
function updateBalanceChart(totalIncome, totalExpenses) {
    const chartCanvas = document.getElementById('balanceChart');
    if (!chartCanvas) return;
    
    console.log('Updating balance chart with:', { totalIncome, totalExpenses });
    
    // Create or update chart
    if (window.balanceChart) {
        console.log('Updating existing balance chart');
        window.balanceChart.data.datasets[0].data = [totalExpenses, totalIncome];
        window.balanceChart.update();
    } else {
        console.log('Creating new balance chart');
        window.balanceChart = new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Expenses', 'Income'],
                datasets: [{
                    data: [totalExpenses, totalIncome],
                    backgroundColor: ['#f44336', '#4caf50'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Update recent transactions
function updateRecentTransactions(transactions) {
    const transactionsContainer = document.getElementById('recentTransactions');
    if (!transactionsContainer) return;
    
    // Clear existing transactions
    transactionsContainer.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsContainer.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted mb-0">No transactions found</p>
            </div>
        `;
        return;
    }
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Take only the first 5 transactions
    const recentTransactions = sortedTransactions.slice(0, 5);
    
    console.log('Updating recent transactions:', recentTransactions.length);
    
    // Add transactions to container
    recentTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        // Format date
        const transactionDate = new Date(transaction.date);
        const formattedDate = transactionDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Determine if it's income or expense
        const isIncome = transaction.type === 'income';
        const amountClass = isIncome ? 'income' : 'expense';
        const amountPrefix = isIncome ? '+' : '-';
        
        transactionElement.innerHTML = `
            <div class="category-icon ${getCategoryClass(transaction.category)}">
                <i class="${getCategoryIcon(transaction.category, transaction.type)}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.title}</div>
                <div class="transaction-date">${formattedDate}</div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountPrefix}${formatCurrency(transaction.amount)}
            </div>
        `;
        
        transactionsContainer.appendChild(transactionElement);
    });
}

// Update expense trends
function updateExpenseTrends(expenses) {
    const chartCanvas = document.getElementById('expensesChart');
    if (!chartCanvas) return;
    
    console.log('Updating expense trends with', expenses.length, 'expenses');
    
    // Get last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Filter expenses for last 30 days
    const recentExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= thirtyDaysAgo && expenseDate <= today;
    });
    
    console.log('Recent expenses (last 30 days):', recentExpenses.length);
    
    // Group expenses by date
    const expensesByDate = {};
    
    // Initialize all dates in the last 30 days with 0
    for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        expensesByDate[dateString] = 0;
    }
    
    // Sum expenses by date
    recentExpenses.forEach(expense => {
        const dateString = new Date(expense.date).toISOString().split('T')[0];
        if (expensesByDate[dateString] !== undefined) {
            expensesByDate[dateString] += expense.amount;
        }
    });
    
    // Prepare chart data
    const labels = Object.keys(expensesByDate).map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = Object.values(expensesByDate);
    
    console.log('Chart data prepared:', { labels: labels.length, data: data.length });
    
    // Create or update chart
    if (window.expensesChart) {
        console.log('Updating existing expenses chart');
        window.expensesChart.data.labels = labels;
        window.expensesChart.data.datasets[0].data = data;
        window.expensesChart.update();
    } else {
        console.log('Creating new expenses chart');
        window.expensesChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses',
                    data: data,
                    backgroundColor: 'rgba(244, 67, 54, 0.7)',
                    borderColor: '#f44336',
                    borderWidth: 1,
                    borderRadius: 4,
                    barThickness: 8,
                    maxBarThickness: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Expense: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Update recent expenses
function updateRecentExpenses(expenses) {
    const expensesContainer = document.getElementById('expensesList');
    if (!expensesContainer) return;
    
    // Clear existing expenses
    expensesContainer.innerHTML = '';
    
    if (expenses.length === 0) {
        expensesContainer.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted mb-0">No expenses found</p>
            </div>
        `;
        return;
    }
    
    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Take only the first 5 expenses
    const recentExpenses = sortedExpenses.slice(0, 5);
    
    console.log('Updating recent expenses:', recentExpenses.length);
    
    // Add expenses to container
    recentExpenses.forEach(expense => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'transaction-item';
        
        // Format date
        const expenseDate = new Date(expense.date);
        const formattedDate = expenseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        expenseElement.innerHTML = `
            <div class="category-icon ${getCategoryClass(expense.category)}">
                <i class="${getCategoryIcon(expense.category, 'expense')}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${expense.title}</div>
                <div class="transaction-date">${formattedDate}</div>
            </div>
            <div class="transaction-amount expense">
                -${formatCurrency(expense.amount)}
            </div>
        `;
        
        expensesContainer.appendChild(expenseElement);
    });
}

// Helper function to get category icon
function getCategoryIcon(category, type) {
    const incomeIcons = {
        'Salary': 'fas fa-money-bill-wave',
        'Freelance': 'fas fa-laptop',
        'Investments': 'fas fa-chart-line',
        'Interest': 'fas fa-percentage',
        'Gifts': 'fas fa-gift',
        'Other': 'fas fa-ellipsis-h'
    };
    
    const expenseIcons = {
        'Food': 'fas fa-utensils',
        'Transport': 'fas fa-car',
        'Entertainment': 'fas fa-film',
        'Shopping': 'fas fa-shopping-bag',
        'Housing': 'fas fa-home',
        'Utilities': 'fas fa-bolt',
        'Healthcare': 'fas fa-medkit',
        'Insurance': 'fas fa-shield-alt',
        'Debt': 'fas fa-credit-card',
        'Savings': 'fas fa-piggy-bank',
        'Other': 'fas fa-ellipsis-h'
    };
    
    if (type === 'income') {
        return incomeIcons[category] || 'fas fa-ellipsis-h';
    } else {
        return expenseIcons[category] || 'fas fa-ellipsis-h';
    }
}

// Helper function to get category class
function getCategoryClass(category) {
    return category.toLowerCase();
}

// Format currency
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Initialize bootstrap components
const bootstrap = window.bootstrap;

// Helper function to get token from local storage
function getToken() {
    return localStorage.getItem('token');
}

// Helper function to check authentication
function requireAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Helper function to update user interface
function updateUserUI() {
    // Implement user interface update logic here
    // For example, display user's name or profile picture
}

// Helper function to show loading indicator
function showLoading() {
    // Implement loading indicator logic here
    // For example, display a spinner or overlay
}

// Helper function to hide loading indicator
function hideLoading() {
    // Implement hide loading indicator logic here
    // For example, hide the spinner or overlay
}

// Helper function to show error message
function showError(message) {
    // Implement error message display logic here
    // For example, display an alert or toast
    alert(message);
}

// Helper function to handle logout
function logout() {
    // Implement logout logic here
    // For example, remove token from local storage and redirect to login page
    localStorage.removeItem('token');
    window.location.href = '/index.html';
}