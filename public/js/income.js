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
    

});


//Adding Income
document.getElementById('incomeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const expenseData = { description, amount, category, date };

    const token = localStorage.getItem('token');

    try {
        const res = await fetch('/api/income', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(expenseData)
        });

        const result = await res.json();

        if (res.status === 201) {
            alert('Income added successfully!');
            document.getElementById('incomeForm').reset();
            location.reload(); // ⬅ Reload page to refresh chart
        } else {
            alert(result.message || 'Failed to add income.');
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while adding the income.');
    }
});


//logout Button
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});