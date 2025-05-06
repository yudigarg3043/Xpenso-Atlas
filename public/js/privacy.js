const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    });
}
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = '/';
        return;
    }

    document.getElementById('userName').textContent = user.fullName;
});

document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const themeBtn = document.getElementById("themeSwitcher");
    const themeIcon = document.getElementById("themeIcon");

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        body.classList.add("light-theme");
        themeIcon.classList.replace("fa-sun", "fa-moon");
    }

    themeBtn.addEventListener("click", function () {
        body.classList.toggle("light-theme");
        const isLight = body.classList.contains("light-theme");

        // Toggle icon
        themeIcon.classList.toggle("fa-sun", !isLight);
        themeIcon.classList.toggle("fa-moon", isLight);

        // Store preference
        localStorage.setItem("theme", isLight ? "light" : "dark");
    });
});
