// Income specific JavaScript
let incomeChart;
let incomeData = [];

// Utility functions (assuming these are defined elsewhere or in a separate file)
function getCategoryIcon(category) {
    const icons = {
        'Salary': 'fas fa-money-bill-wave',
        'Freelance': 'fas fa-laptop',
        'Investments': 'fas fa-chart-line',
        'Interest': 'fas fa-percentage',
        'Gifts': 'fas fa-gift',
        'Other': 'fas fa-ellipsis-h'
    };
    
    return icons[category] || 'fas fa-ellipsis-h';
}

// Helper function to get category class
function getCategoryClass(category) {
    return category.toLowerCase();
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
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

// Fetch income data
async function fetchIncomeData() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/incomes', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch income data');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching income data:', error);
        return [];
    }
}

// Render income table
function renderIncomeTable(incomes) {
    const tableBody = document.getElementById('incomeTableBody');
    tableBody.innerHTML = '';
    
    if (incomes.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" class="text-center py-4">No income records found</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    incomes.forEach(income => {
        const row = document.createElement('tr');
        const icon = getCategoryIcon(income.category);
        const date = formatDate(income.date);
        const amount = formatCurrency(income.amount);
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="category-icon ${income.category.toLowerCase()}">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <div>
                        <div class="fw-medium">${income.title}</div>
                        <div class="text-muted small">${income.category}</div>
                    </div>
                </div>
            </td>
            <td>${date}</td>
            <td class="text-success fw-medium">+ ${amount}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary edit-income" data-id="${income._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-income" data-id="${income._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-income').forEach(button => {
        button.addEventListener('click', () => openEditIncomeModal(button.dataset.id));
    });
    
    document.querySelectorAll('.delete-income').forEach(button => {
        button.addEventListener('click', () => deleteIncome(button.dataset.id));
    });
}

// Initialize income chart
function initIncomeChart(incomes) {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Process data for chart
    const dates = [];
    const amounts = [];
    
    // Group incomes by date
    const groupedIncomes = {};
    
    incomes.forEach(income => {
        const date = new Date(income.date);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!groupedIncomes[dateStr]) {
            groupedIncomes[dateStr] = 0;
        }
        
        groupedIncomes[dateStr] += income.amount;
    });
    
    // Sort dates
    const sortedDates = Object.keys(groupedIncomes).sort();
    
    sortedDates.forEach(date => {
        const displayDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dates.push(displayDate);
        amounts.push(groupedIncomes[date]);
    });
    
    // Create chart
    incomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Income',
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

// Add new income
async function addIncome() {
    const token = localStorage.getItem('token');
    
    const title = document.getElementById('incomeTitle').value;
    const amount = document.getElementById('incomeAmount').value;
    const date = document.getElementById('incomeDate').value;
    const category = document.getElementById('incomeCategory').value;
    const notes = document.getElementById('incomeNotes').value;
    
    try {
        const response = await fetch('/api/incomes', {
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
            throw new Error('Failed to add income');
        }
        
        // Close modal
        const modalElement = document.getElementById('addIncomeModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Reset form
        document.getElementById('addIncomeForm').reset();
        
        // Refresh data
        await loadIncomeData();
        
        // Show success message
        alert('Income added successfully');
    } catch (error) {
        console.error('Error adding income:', error);
        alert('Failed to add income');
    }
}

// Open edit income modal
function openEditIncomeModal(incomeId) {
    const income = incomeData.find(inc => inc._id === incomeId);
    
    if (!income) {
        console.error('Income not found');
        return;
    }
    
    // Set form values
    document.getElementById('editIncomeId').value = income._id;
    document.getElementById('editIncomeTitle').value = income.title;
    document.getElementById('editIncomeAmount').value = income.amount;
    document.getElementById('editIncomeDate').value = new Date(income.date).toISOString().split('T')[0];
    document.getElementById('editIncomeCategory').value = income.category;
    document.getElementById('editIncomeNotes').value = income.notes || '';
    
    // Open modal
    const modal = new bootstrap.Modal(document.getElementById('editIncomeModal'));
    modal.show();
}

// Update income
async function updateIncome() {
    const token = localStorage.getItem('token');
    const incomeId = document.getElementById('editIncomeId').value;
    
    const title = document.getElementById('editIncomeTitle').value;
    const amount = document.getElementById('editIncomeAmount').value;
    const date = document.getElementById('editIncomeDate').value;
    const category = document.getElementById('editIncomeCategory').value;
    const notes = document.getElementById('editIncomeNotes').value;
    
    try {
        const response = await fetch(`/api/incomes/${incomeId}`, {
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
            throw new Error('Failed to update income');
        }
        
        // Close modal
        const modalElement = document.getElementById('editIncomeModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
        
        // Refresh data
        await loadIncomeData();
        
        // Show success message
        alert('Income updated successfully');
    } catch (error) {
        console.error('Error updating income:', error);
        alert('Failed to update income');
    }
}

// Delete income
async function deleteIncome(incomeId) {
    if (!confirm('Are you sure you want to delete this income?')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`/api/incomes/${incomeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete income');
        }
        
        // Refresh data
        await loadIncomeData();
        
        // Show success message
        alert('Income deleted successfully');
    } catch (error) {
        console.error('Error deleting income:', error);
        alert('Failed to delete income');
    }
}

// Download income data as CSV
function downloadIncomeData() {
    if (incomeData.length === 0) {
        alert('No income data to download');
        return;
    }
    
    // Create CSV content
    let csvContent = 'Title,Category,Amount,Date,Notes\n';
    
    incomeData.forEach(income => {
        const row = [
            income.title,
            income.category,
            income.amount,
            new Date(income.date).toLocaleDateString(),
            income.notes || ''
        ].map(cell => `"${cell}"`).join(',');
        
        csvContent += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `income_data_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
}

// Load income data
async function loadIncomeData() {
    // Fetch income data
    incomeData = await fetchIncomeData();
    
    // Render income table
    renderIncomeTable(incomeData);
    
    // Initialize or update chart
    if (incomeChart) {
        incomeChart.destroy();
    }
    initIncomeChart(incomeData);
}

// Initialize income page
function initIncomePage() {
    // Load income data
    loadIncomeData();
    
    // Set up event listeners
    document.getElementById('saveIncomeBtn').addEventListener('click', addIncome);
    document.getElementById('updateIncomeBtn').addEventListener('click', updateIncome);
    document.getElementById('downloadBtn').addEventListener('click', downloadIncomeData);
    
    // Set default date for new income
    document.getElementById('incomeDate').valueAsDate = new Date();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const requireAuth = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return false;
        }
        return true;
    };

    if (!requireAuth()) return;
    
    // Initialize UI elements
    initUI();
    
    // Load income data
    loadIncomeDataFromServer();
    
    // Setup event listeners
    setupEventListeners();
    
    // Add debug logging
    console.log('Income page initialized');
});

// Initialize UI elements
function initUI() {
    // Update user info in UI
    updateUserUI();
    
    // Set default date for income form to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
}

// Setup event listeners
function setupEventListeners() {
    // Save income button
    const saveIncomeBtn = document.getElementById('saveIncomeBtn');
    if (saveIncomeBtn) {
        saveIncomeBtn.addEventListener('click', saveIncome);
    }
    
    // Update income button
    const updateIncomeBtn = document.getElementById('updateIncomeBtn');
    if (updateIncomeBtn) {
        updateIncomeBtn.addEventListener('click', updateExistingIncome);
    }
    
    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadIncomeData);
    }
    
    // Add debug logging
    console.log('Event listeners set up');
}

// Load income data from server
async function loadIncomeDataFromServer() {
    try {
        showLoading();
        console.log('Loading income data...');
        
        const token = localStorage.getItem('token');
        const response = await fetch('/api/income', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch income data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Income data loaded:', data);
        
        // Store income data globally
        incomeData = data.incomes || [];
        
        // Update UI with income data
        updateIncomeUI(data);
        
        hideLoading();
    } catch (error) {
        console.error('Error loading income data:', error);
        showError('Failed to load income data. Please try again later.');
        hideLoading();
    }
}

// Update UI with income data
function updateIncomeUI(data) {
    // Update total income value
    updateTotalIncome(data.incomes || []);
    
    // Update income table
    updateIncomeTable(data.incomes || []);
    
    // Update income chart
    updateIncomeChart(data.incomes || []);
    
    // Update top income sources
    updateTopIncomeSources(data.incomes || []);
    
    console.log('Income UI updated');
}

// Update total income value
function updateTotalIncome(incomes) {
    const totalIncomeElement = document.getElementById('totalIncomeValue');
    if (!totalIncomeElement) return;
    
    // Calculate total income for current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
    });
    
    const totalIncome = monthlyIncomes.reduce((total, income) => total + income.amount, 0);
    totalIncomeElement.textContent = formatCurrency(totalIncome);
    
    console.log('Total income updated:', totalIncome);
}

// Update income table
function updateIncomeTable(incomes) {
    const tableBody = document.getElementById('incomeTableBody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Sort incomes by date (newest first)
    const sortedIncomes = [...incomes].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedIncomes.length === 0) {
        // No income records
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" class="text-center py-4">
                <p class="text-muted mb-0">No income records found</p>
                <button class="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addIncomeModal">
                    <i class="fas fa-plus me-1"></i> Add Income
                </button>
            </td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add income rows
    sortedIncomes.forEach(income => {
        const row = document.createElement('tr');
        
        // Format date
        const incomeDate = new Date(income.date);
        const formattedDate = incomeDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="category-icon ${getCategoryClass(income.category)}">
                        <i class="${getCategoryIcon(income.category)}"></i>
                    </div>
                    <div>
                        <div class="fw-medium">${income.title}</div>
                        <div class="text-muted small">${income.category}</div>
                    </div>
                </div>
            </td>
            <td>${formattedDate}</td>
            <td class="text-success fw-medium">${formatCurrency(income.amount)}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary edit-income-btn" data-id="${income._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-income-btn" data-id="${income._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // Add event listeners to buttons
        const editBtn = row.querySelector('.edit-income-btn');
        const deleteBtn = row.querySelector('.delete-income-btn');
        
        editBtn.addEventListener('click', () => openEditIncomeModalFromServer(income));
        deleteBtn.addEventListener('click', () => confirmDeleteIncome(income._id));
    });
    
    console.log('Income table updated with', sortedIncomes.length, 'records');
}

// Update income chart
function updateIncomeChart(incomes) {
    const chartCanvas = document.getElementById('incomeChart');
    if (!chartCanvas) return;
    
    console.log('Updating income chart with', incomes.length, 'records');
    
    // Get last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Filter incomes for last 30 days
    const recentIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= thirtyDaysAgo && incomeDate <= today;
    });
    
    console.log('Recent incomes (last 30 days):', recentIncomes.length);
    
    // Group incomes by date
    const incomesByDate = {};
    
    // Initialize all dates in the last 30 days with 0
    for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        incomesByDate[dateString] = 0;
    }
    
    // Sum incomes by date
    recentIncomes.forEach(income => {
        const dateString = new Date(income.date).toISOString().split('T')[0];
        if (incomesByDate[dateString] !== undefined) {
            incomesByDate[dateString] += income.amount;
        }
    });
    
    // Prepare chart data
    const labels = Object.keys(incomesByDate).map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = Object.values(incomesByDate);
    
    console.log('Chart data prepared:', { labels: labels.length, data: data.length });
    
    // Create or update chart
    if (window.incomeChart) {
        console.log('Updating existing chart');
        window.incomeChart.data.labels = labels;
        window.incomeChart.data.datasets[0].data = data;
        window.incomeChart.update();
    } else {
        console.log('Creating new chart');
        window.incomeChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Income',
                    data: data,
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderColor: '#4caf50',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#4caf50',
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
                                return `Income: ${formatCurrency(context.raw)}`;
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

// Update top income sources
function updateTopIncomeSources(incomes) {
    const topSourcesElement = document.getElementById('topIncomeSources');
    if (!topSourcesElement) return;
    
    // Clear existing content
    topSourcesElement.innerHTML = '';
    
    // Get current month incomes
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
    });
    
    if (monthlyIncomes.length === 0) {
        topSourcesElement.innerHTML = `
            <div class="text-center py-3">
                <p class="text-muted mb-0">No income records for this month</p>
            </div>
        `;
        return;
    }
    
    // Group by category and sum amounts
    const categorySums = {};
    monthlyIncomes.forEach(income => {
        if (!categorySums[income.category]) {
            categorySums[income.category] = 0;
        }
        categorySums[income.category] += income.amount;
    });
    
    // Convert to array and sort by amount (descending)
    const sortedCategories = Object.entries(categorySums)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
    
    // Take top 3 categories
    const topCategories = sortedCategories.slice(0, 3);
    
    // Calculate total income
    const totalIncome = monthlyIncomes.reduce((total, income) => total + income.amount, 0);
    
    // Create progress bars for top categories
    topCategories.forEach(({ category, amount }) => {
        const percentage = Math.round((amount / totalIncome) * 100);
        
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
                <span class="text-success">${formatCurrency(amount)}</span>
            </div>
            <div class="progress" style="height: 6px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%;" 
                    aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        `;
        
        topSourcesElement.appendChild(categoryItem);
    });
    
    console.log('Top income sources updated');
}

// Save new income
async function saveIncome() {
    // Get form values
    const title = document.getElementById('incomeTitle').value.trim();
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const date = document.getElementById('incomeDate').value;
    const category = document.getElementById('incomeCategory').value;
    const notes = document.getElementById('incomeNotes').value.trim();
    
    // Validate form
    if (!title || isNaN(amount) || amount <= 0 || !date || !category) {
        showError('Please fill all required fields correctly.');
        return;
    }
    
    try {
        showLoading();
        console.log('Saving income:', { title, amount, date, category });
        
        const token = getToken();
        const response = await fetch('/api/income', {
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
            throw new Error(errorData.error || 'Failed to save income');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addIncomeModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addIncomeForm').reset();
        document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
        
        // Reload income data
        await loadIncomeDataFromServer();
        
        // Show success message
        showSuccess('Income added successfully!');
        
        hideLoading();
    } catch (error) {
        console.error('Error saving income:', error);
        showError('Failed to save income. Please try again later.');
        hideLoading();
    }
}

// Open edit income modal
function openEditIncomeModalFromServer(income) {
    console.log('Opening edit modal for income:', income);
    
    // Set form values
    document.getElementById('editIncomeId').value = income._id;
    document.getElementById('editIncomeTitle').value = income.title;
    document.getElementById('editIncomeAmount').value = income.amount;
    document.getElementById('editIncomeDate').value = new Date(income.date).toISOString().split('T')[0];
    document.getElementById('editIncomeCategory').value = income.category;
    document.getElementById('editIncomeNotes').value = income.notes || '';
    
    // Open modal
    const modal = new bootstrap.Modal(document.getElementById('editIncomeModal'));
    modal.show();
}

// Update income
async function updateExistingIncome() {
    // Get form values
    const id = document.getElementById('editIncomeId').value;
    const title = document.getElementById('editIncomeTitle').value.trim();
    const amount = parseFloat(document.getElementById('editIncomeAmount').value);
    const date = document.getElementById('editIncomeDate').value;
    const category = document.getElementById('editIncomeCategory').value;
    const notes = document.getElementById('editIncomeNotes').value.trim();
    
    // Validate form
    if (!title || isNaN(amount) || amount <= 0 || !date || !category) {
        showError('Please fill all required fields correctly.');
        return;
    }
    
    try {
        showLoading();
        console.log('Updating income:', { id, title, amount, date, category });
        
        const token = getToken();
        const response = await fetch(`/api/income/${id}`, {
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
            throw new Error(errorData.error || 'Failed to update income');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editIncomeModal'));
        modal.hide();
        
        // Reload income data
        await loadIncomeDataFromServer();
        
        // Show success message
        showSuccess('Income updated successfully!');
        
        hideLoading();
    } catch (error) {
        console.error('Error updating income:', error);
        showError('Failed to update income. Please try again later.');
        hideLoading();
    }
}

// Confirm delete income
function confirmDeleteIncome(id) {
    if (confirm('Are you sure you want to delete this income record? This action cannot be undone.')) {
        deleteIncomeFromServer(id);
    }
}

// Delete income
async function deleteIncomeFromServer(id) {
    try {
        showLoading();
        console.log('Deleting income:', id);
        
        const token = getToken();
        const response = await fetch(`/api/income/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete income');
        }
        
        // Reload income data
        await loadIncomeDataFromServer();
        
        // Show success message
        showSuccess('Income deleted successfully!');
        
        hideLoading();
    } catch (error) {
        console.error('Error deleting income:', error);
        showError('Failed to delete income. Please try again later.');
        hideLoading();
    }
}

// Download income data as CSV
function downloadIncomeDataFromServer() {
    try {
        const tableBody = document.getElementById('incomeTableBody');
        if (!tableBody || tableBody.children.length === 0 || tableBody.querySelector('td[colspan]')) {
            showError('No income data to download.');
            return;
        }
        
        // Create CSV content
        let csvContent = 'Title,Category,Date,Amount,Notes\n';
        
        // Get all income rows
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            // Skip empty row
            if (row.querySelector('td[colspan]')) return;
            
            // Get income data from row
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
        link.setAttribute('download', `income_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Income data downloaded successfully!');
    } catch (error) {
        console.error('Error downloading income data:', error);
        showError('Failed to download income data. Please try again later.');
    }
}

// Helper function to get category class
function getToken() {
    return localStorage.getItem('token');
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