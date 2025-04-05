// Expense specific JavaScript
let expenseChart;
let expenseData = [];

// Utility functions (assuming these are defined elsewhere or in a separate file)
// For demonstration, I'll provide simple implementations.  In a real application,
// these would likely be in a shared utility file.
function getCategoryIcon(category) {
    const icons = {
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
    
    return icons[category] || 'fas fa-ellipsis-h';
}

// Helper function to get category class
function getCategoryClass(category) {
    return category.toLowerCase();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Show loading
function showLoading() {
    // Implement loading indicator
    // This could be a spinner or overlay
}

// Hide loading
function hideLoading() {
    // Hide loading indicator
}

// Show error message
function showError(message) {
    alert(message); // Replace with better UI notification
}

// Show success message
function showSuccess(message) {
    alert(message); // Replace with better UI notification
}

// Fetch expense data
async function fetchExpenseData() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/expenses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch expense data');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching expense data:', error);
        return [];
    }
}

// Render expense table
function renderExpenseTable(expenses) {
    const tableBody = document.getElementById('expenseTableBody');
    tableBody.innerHTML = '';
    
    if (expenses.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" class="text-center py-4">No expense records found</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        const icon = getCategoryIcon(expense.category);
        const date = formatDate(expense.date);
        const amount = formatCurrency(expense.amount);
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="category-icon ${expense.category.toLowerCase()}">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <div>
                        <div class="fw-medium">${expense.title}</div>
                        <div class="text-muted small">${expense.category}</div>
                    </div>
                </div>
            </td>
            <td>${date}</td>
            <td class="text-danger fw-medium">- ${amount}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary edit-expense" data-id="${expense._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-expense" data-id="${expense._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-expense').forEach(button => {
        button.addEventListener('click', () => openEditExpenseModal(button.dataset.id));
    });
    
    document.querySelectorAll('.delete-expense').forEach(button => {
        button.addEventListener('click', () => deleteExpense(button.dataset.id));
    });
}

// Initialize expense chart
function initExpenseChart(expenses) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
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
    expenseChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Expenses',
                data: amounts,
                borderColor: '#7c4dff',
                backgroundColor: 'rgba(124, 77, 255, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#7c4dff',
                pointRadius: 4,
                pointHoverRadius: 6
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

// Add new expense
async function addExpense() {
    const token = localStorage.getItem('token');
    
    const title = document.getElementById('expenseTitle').value;
    const amount = document.getElementById('expenseAmount').value;
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;
    const notes = document.getElementById('expenseNotes').value;
    
    try {
        const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                amount: parseFloat(amount),
                date,
                category,
                notes,
                icon: getCategoryIcon(category)
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add expense');
        }
        
        // Close modal
        const modalElement = document.getElementById('addExpenseModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Reset form
        document.getElementById('addExpenseForm').reset();
        
        // Refresh data
        await loadExpenseData();
        
        // Show success message
        alert('Expense added successfully');
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('Failed to add expense');
    }
}

// Open edit expense modal
function openEditExpenseModal(expenseId) {
    const expense = expenseData.find(exp => exp._id === expenseId);
    
    if (!expense) {
        console.error('Expense not found');
        return;
    }
    
    // Set form values
    document.getElementById('editExpenseId').value = expense._id;
    document.getElementById('editExpenseTitle').value = expense.title;
    document.getElementById('editExpenseAmount').value = expense.amount;
    document.getElementById('editExpenseDate').value = new Date(expense.date).toISOString().split('T')[0];
    document.getElementById('editExpenseCategory').value = expense.category;
    document.getElementById('editExpenseNotes').value = expense.notes || '';
    
    // Open modal
    const modal = new bootstrap.Modal(document.getElementById('editExpenseModal'));
    modal.show();
}

// Update expense
async function updateExpense() {
    const token = localStorage.getItem('token');
    const expenseId = document.getElementById('editExpenseId').value;
    
    const title = document.getElementById('editExpenseTitle').value;
    const amount = document.getElementById('editExpenseAmount').value;
    const date = document.getElementById('editExpenseDate').value;
    const category = document.getElementById('editExpenseCategory').value;
    const notes = document.getElementById('editExpenseNotes').value;
    
    try {
        const response = await fetch(`/api/expenses/${expenseId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                amount: parseFloat(amount),
                date,
                category,
                notes,
                icon: getCategoryIcon(category)
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update expense');
        }
        
        // Close modal
        const modalElement = document.getElementById('editExpenseModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Refresh data
        await loadExpenseData();
        
        // Show success message
        alert('Expense updated successfully');
    } catch (error) {
        console.error('Error updating expense:', error);
        alert('Failed to update expense');
    }
}

// Delete expense
async function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`/api/expenses/${expenseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }
        
        // Refresh data
        await loadExpenseData();
        
        // Show success message
        alert('Expense deleted successfully');
    } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
    }
}

// Download expense data as CSV
function downloadExpenseDataOld() {
    if (expenseData.length === 0) {
        alert('No expense data to download');
        return;
    }
    
    // Create CSV content
    let csvContent = 'Title,Category,Amount,Date,Notes\n';
    
    expenseData.forEach(expense => {
        const row = [
            expense.title,
            expense.category,
            expense.amount,
            new Date(expense.date).toLocaleDateString(),
            expense.notes || ''
        ].map(cell => `"${cell}"`).join(',');
        
        csvContent += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `expense_data_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
}

// Load expense data from server
async function loadExpenseData() {
    try {
        showLoading();
        console.log('Loading expense data...');
        
        const token = getToken();
        const response = await fetch('/api/expense', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch expense data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Expense data loaded:', data);
        
        // Store expense data globally
        expenseData = data.expenses || [];
        
        // Update UI with expense data
        updateExpenseUI(data);
        
        hideLoading();
    } catch (error) {
        console.error('Error loading expense data:', error);
        showError('Failed to load expense data. Please try again later.');
        hideLoading();
    }
}

// Update UI with expense data
function updateExpenseUI(data) {
    // Update total expense value
    updateTotalExpense(data.expenses || []);
    
    // Update expense table
    updateExpenseTable(data.expenses || []);
    
    // Update expense chart
    updateExpenseChart(data.expenses || []);
    
    // Update top expense categories
    updateTopExpenseCategories(data.expenses || []);
    
    console.log('Expense UI updated');
}

// Update total expense value
function updateTotalExpense(expenses) {
    const totalExpenseElement = document.getElementById('totalExpenseValue');
    if (!totalExpenseElement) return;
    
    // Calculate total expense for current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const totalExpense = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
    totalExpenseElement.textContent = formatCurrency(totalExpense);
    
    console.log('Total expense updated:', totalExpense);
}

// Update expense table
function updateExpenseTable(expenses) {
    const tableBody = document.getElementById('expenseTableBody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Sort expenses by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedExpenses.length === 0) {
        // No expense records
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" class="text-center py-4">
                <p class="text-muted mb-0">No expense records found</p>
                <button class="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addExpenseModal">
                    <i class="fas fa-plus me-1"></i> Add Expense
                </button>
            </td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add expense rows
    sortedExpenses.forEach(expense => {
        const row = document.createElement('tr');
        
        // Format date
        const expenseDate = new Date(expense.date);
        const formattedDate = expenseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="category-icon ${getCategoryClass(expense.category)}">
                        <i class="${getCategoryIcon(expense.category)}"></i>
                    </div>
                    <div>
                        <div class="fw-medium">${expense.title}</div>
                        <div class="text-muted small">${expense.category}</div>
                    </div>
                </div>
            </td>
            <td>${formattedDate}</td>
            <td class="text-danger fw-medium">${formatCurrency(expense.amount)}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary edit-expense-btn" data-id="${expense._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-expense-btn" data-id="${expense._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // Add event listeners to buttons
        const editBtn = row.querySelector('.edit-expense-btn');
        const deleteBtn = row.querySelector('.delete-expense-btn');
        
        editBtn.addEventListener('click', () => openEditExpenseModalInner(expense));
        deleteBtn.addEventListener('click', () => confirmDeleteExpense(expense._id));
    });
    
    console.log('Expense table updated with', sortedExpenses.length, 'records');
}

// Update expense chart
function updateExpenseChart(expenses) {
    const chartCanvas = document.getElementById('expenseChart');
    if (!chartCanvas) return;
    
    console.log('Updating expense chart with', expenses.length, 'records');
    
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
    if (window.expenseChart) {
        console.log('Updating existing chart');
        window.expenseChart.data.labels = labels;
        window.expenseChart.data.datasets[0].data = data;
        window.expenseChart.update();
    } else {
        console.log('Creating new chart');
        window.expenseChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expense',
                    data: data,
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderColor: '#f44336',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#f44336',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
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

// Update top expense categories
function updateTopExpenseCategories(expenses) {
    const topCategoriesElement = document.getElementById('topExpenseCategories');
    if (!topCategoriesElement) return;
    
    // Clear existing content
    topCategoriesElement.innerHTML = '';
    
    // Get current month expenses
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    if (monthlyExpenses.length === 0) {
        topCategoriesElement.innerHTML = `
            <div class="text-center py-3">
                <p class="text-muted mb-0">No expense records for this month</p>
            </div>
        `;
        return;
    }
    
    // Group by category and sum amounts
    const categorySums = {};
    monthlyExpenses.forEach(expense => {
        if (!categorySums[expense.category]) {
            categorySums[expense.category] = 0;
        }
        categorySums[expense.category] += expense.amount;
    });
    
    // Convert to array and sort by amount (descending)
    const sortedCategories = Object.entries(categorySums)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
    
    // Take top 3 categories
    const topCategories = sortedCategories.slice(0, 3);
    
    // Calculate total expense
    const totalExpense = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Create progress bars for top categories
    topCategories.forEach(({ category, amount }) => {
        const percentage = Math.round((amount / totalExpense) * 100);
        
        const categoryItem = document.createElement('div');
        categoryItem.className = 'mb-3';
        categoryItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <div class="d-flex align-items-center">
                    <div class="category-icon ${getCategoryClass(category)} me-2" style="width: 24px; height: 24px;">
                        <i class="${getCategoryIcon(category)} fa-sm"></i>
                    </div>
                    <span>${category}</span>
                </div>
                <span class="text-danger">${formatCurrency(amount)}</span>
            </div>
            <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${percentage}%;" 
                    aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        `;
        
        topCategoriesElement.appendChild(categoryItem);
    });
    
    console.log('Top expense categories updated');
}

// Save new expense
async function saveExpense() {
    // Get form values
    const title = document.getElementById('expenseTitle').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;
    const notes = document.getElementById('expenseNotes').value.trim();
    
    // Validate form
    if (!title || isNaN(amount) || amount <= 0 || !date || !category) {
        showError('Please fill all required fields correctly.');
        return;
    }
    
    try {
        showLoading();
        console.log('Saving expense:', { title, amount, date, category });
        
        const token = getToken();
        const response = await fetch('/api/expense', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                amount,
                date,
                category,
                notes
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save expense');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addExpenseModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addExpenseForm').reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        
        // Reload expense data
        await loadExpenseData();
        
        // Show success message
        showSuccess('Expense added successfully!');
        
        hideLoading();
    } catch (error) {
        console.error('Error saving expense:', error);
        showError('Failed to save expense. Please try again later.');
        hideLoading();
    }
}

// Open edit expense modal
function openEditExpenseModalInner(expense) {
    console.log('Opening edit modal for expense:', expense);
    
    // Set form values
    document.getElementById('editExpenseId').value = expense._id;
    document.getElementById('editExpenseTitle').value = expense.title;
    document.getElementById('editExpenseAmount').value = expense.amount;
    document.getElementById('editExpenseDate').value = new Date(expense.date).toISOString().split('T')[0];
    document.getElementById('editExpenseCategory').value = expense.category;
    document.getElementById('editExpenseNotes').value = expense.notes || '';
    
    // Open modal
    const modal = new bootstrap.Modal(document.getElementById('editExpenseModal'));
    modal.show();
}

// Update expense
async function updateExpenseInner() {
    // Get form values
    const id = document.getElementById('editExpenseId').value;
    const title = document.getElementById('editExpenseTitle').value.trim();
    const amount = parseFloat(document.getElementById('editExpenseAmount').value);
    const date = document.getElementById('editExpenseDate').value;
    const category = document.getElementById('editExpenseCategory').value;
    const notes = document.getElementById('editExpenseNotes').value.trim();
    
    // Validate form
    if (!title || isNaN(amount) || amount <= 0 || !date || !category) {
        showError('Please fill all required fields correctly.');
        return;
    }
    
    try {
        showLoading();
        console.log('Updating expense:', { id, title, amount, date, category });
        
        const token = getToken();
        const response = await fetch(`/api/expense/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                amount,
                date,
                category,
                notes
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update expense');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editExpenseModal'));
        modal.hide();
        
        // Reload expense data
        await loadExpenseData();
        
        // Show success message
        showSuccess('Expense updated successfully!');
        
        hideLoading();
    } catch (error) {
        console.error('Error updating expense:', error);
        showError('Failed to update expense. Please try again later.');
        hideLoading();
    }
}

// Confirm delete expense
function confirmDeleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense record? This action cannot be undone.')) {
        deleteExpenseInner(id);
    }
}

// Delete expense
async function deleteExpenseInner(id) {
    try {
        showLoading();
        console.log('Deleting expense:', id);
        
        const token = getToken();
        const response = await fetch(`/api/expense/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete expense');
        }
        
        // Reload expense data
        await loadExpenseData();
        
        // Show success message
        showSuccess('Expense deleted successfully!');
        
        hideLoading();
    } catch (error) {
        console.error('Error deleting expense:', error);
        showError('Failed to delete expense. Please try again later.');
        hideLoading();
    }
}

// Download expense data as CSV
function downloadExpenseData() {
    try {
        const tableBody = document.getElementById('expenseTableBody');
        if (!tableBody || tableBody.children.length === 0 || tableBody.querySelector('td[colspan]')) {
            showError('No expense data to download.');
            return;
        }
        
        // Create CSV content
        let csvContent = 'Title,Category,Date,Amount,Notes\n';
        
        // Get all expense rows
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            // Skip empty row
            if (row.querySelector('td[colspan]')) return;
            
            // Get expense data from row
            const title = row.querySelector('td:nth-child(1) .fw-medium').textContent;
            const category = row.querySelector('td:nth-child(1) .text-muted').textContent;
            const date = row.querySelector('td:nth-child(2)').textContent;
            const amount = row.querySelector('td:nth-child(3)').textContent.replace('$', '');
            
            // Add row to CSV
            csvContent += `"${title}","${category}","${date}","${amount}",""\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `expense_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Expense data downloaded successfully!');
    } catch (error) {
        console.error('Error downloading expense data:', error);
        showError('Failed to download expense data. Please try again later.');
    }
}

// Download expense data as CSV
function downloadExpenseDataInner() {
    try {
        const tableBody = document.getElementById('expenseTableBody');
        if (!tableBody || tableBody.children.length === 0) {
            showError('No expense data to download.');
            return;
        }
        
        // Create CSV content
        let csvContent = 'Title,Category,Date,Amount,Notes\n';
        
        // Get all expense rows
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            // Skip empty row
            if (row.querySelector('td[colspan]')) return;
            
            // Get expense data from row
            const title = row.querySelector('td:nth-child(1) .fw-medium').textContent;
            const category = row.querySelector('td:nth-child(1) .text-muted').textContent;
            const date = row.querySelector('td:nth-child(2)').textContent;
            const amount = row.querySelector('td:nth-child(3)').textContent.replace('$', '');
            
            // Add row to CSV
            csvContent += `"${title}","${category}","${date}","${amount}",""\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `expense_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Expense data downloaded successfully!');
    } catch (error) {
        console.error('Error downloading expense data:', error);
        showError('Failed to download expense data. Please try again later.');
    }
}

// Helper function to get category icon
// function getCategoryIcon(category) {
//     const icons = {
//         'Food': 'fas fa-utensils',
//         'Transport': 'fas fa-car',
//         'Entertainment': 'fas fa-film',
//         'Shopping': 'fas fa-shopping-bag',
//         'Housing': 'fas fa-home',
//         'Utilities': 'fas fa-bolt',
//         'Healthcare': 'fas fa-medkit',
//         'Insurance': 'fas fa-shield-alt',
//         'Debt': 'fas fa-credit-card',
//         'Savings': 'fas fa-piggy-bank',
//         'Other': 'fas fa-ellipsis-h'
//     };
    
//     return icons[category] || 'fas fa-ellipsis-h';
// }

// Helper function to get category class
// function getCategoryClass(category) {
//     return category.toLowerCase();
// }

// Format currency
// function formatCurrency(amount) {
//     return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
// }

// Utility functions for authentication and token retrieval (assuming these are defined elsewhere)
function getToken() {
    return localStorage.getItem('token');
}

function requireAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login'; // Redirect to login page if not authenticated
        return false;
    }
    return true;
}

// Placeholder functions for UI updates (assuming these are defined elsewhere)
function updateUserUI() {
    // Implementation for updating user interface elements
}

function logout() {
    // Implementation for logging out the user
}

// Initialize when DOM is loaded
function initExpensePage() {
    // Load expense data
    loadExpenseData();
    
    // Set up event listeners
    document.getElementById('saveExpenseBtn').addEventListener('click', saveExpense);
    document.getElementById('updateExpenseBtn').addEventListener('click', updateExpenseInner);
    document.getElementById('downloadBtn').addEventListener('click', downloadExpenseData);
    
    // Set default date for new expense
    document.getElementById('expenseDate').valueAsDate = new Date();
}

// Expense page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!requireAuth()) return;
    
    // Initialize UI elements
    initUI();
    
    // Load expense data
    loadExpenseData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Add debug logging
    console.log('Expense page initialized');
});

// Initialize UI elements
function initUI() {
    // Update user info in UI
    updateUserUI();
    
    // Set default date for expense form to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
}

// Setup event listeners
function setupEventListeners() {
    // Save expense button
    const saveExpenseBtn = document.getElementById('saveExpenseBtn');
    if (saveExpenseBtn) {
        saveExpenseBtn.addEventListener('click', saveExpense);
    }
    
    // Update expense button
    const updateExpenseBtn = document.getElementById('updateExpenseBtn');
    if (updateExpenseBtn) {
        updateExpenseBtn.addEventListener('click', updateExpenseInner);
    }
    
    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadExpenseData);
    }
    
    // Add debug logging
    console.log('Event listeners set up');
}

// Initialize bootstrap components
const bootstrap = window.bootstrap;