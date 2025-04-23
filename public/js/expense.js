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

    // 🟢 Fetch expenses and render the doughnut chart
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
                plugins: {
                    title: {
                        display: true,
                        text: 'Expenses by Category'
                    }
                }
            }
        });
    } catch (err) {
        console.error('Error loading chart:', err);
    }

    // 🟢 Fetch and display recent transactions
    async function loadRecentTransactions() {
        try {
            const res = await fetch('/api/expenses/recent', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const list = document.querySelector('.transaction-list');
            list.innerHTML = ''; // Clear old
    
            data.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('transaction-item');
                li.innerHTML = `
                    <div class="transaction-icon expense">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="transaction-details">
                        <span class="transaction-title">${item.category}</span>
                        <span class="transaction-date">${new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <span class="transaction-amount expense">-₹${item.amount.toFixed(2)}</span>
                `;
                list.appendChild(li);
            });
        } catch (err) {
            console.error('Error loading transactions:', err);
        }
    }
    loadRecentTransactions();
    

});

document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});

document.getElementById('expenseForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const expenseData = { description, amount, category, date };

    const token = localStorage.getItem('token');

    try {
        const res = await fetch('/api/expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(expenseData)
        });

        const result = await res.json();

        if (res.status === 201) {
            alert('Expense added successfully!');
            document.getElementById('expenseForm').reset();
            location.reload(); // ⬅ Reload page to refresh chart
        } else {
            alert(result.message || 'Failed to add expense.');
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while adding the expense.');
    }
});
