// Check if user is authenticated
function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Update user UI with user information
function updateUserUI() {
    const token = getToken();
    if (!token) return;
    
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    // Update user name in dropdown
    const userNameDropdown = document.getElementById('userNameDropdown');
    if (userNameDropdown) {
        userNameDropdown.textContent = userName || 'User';
    }
    
    // Update user avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.textContent = userName ? userName.charAt(0).toUpperCase() : 'U';
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Setup logout button in dropdown
    const logoutBtnDropdown = document.getElementById('logoutBtnDropdown');
    if (logoutBtnDropdown) {
        logoutBtnDropdown.addEventListener('click', logout);
    }
    
    // Setup hamburger menu for mobile
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', toggleSidebar);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = '/index.html';
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        sidebar.classList.toggle('active');
        mainContent.classList.toggle('sidebar-active');
    }
}

// Show loading indicator
function showLoading() {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('loadingOverlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    
    loadingOverlay.style.display = 'flex';
}

// Hide loading indicator
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    // Create error toast if it doesn't exist
    let errorToast = document.getElementById('errorToast');
    if (!errorToast) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '5';
        
        toastContainer.innerHTML = `
            <div id="errorToast" class="toast align-items-center text-white bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body" id="errorToastMessage">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        document.body.appendChild(toastContainer);
        errorToast = document.getElementById('errorToast');
    } else {
        document.getElementById('errorToastMessage').textContent = message;
    }
    
    // Ensure Bootstrap is available
    const toast = new bootstrap.Toast(errorToast);
    toast.show();
}

// Show success message
function showSuccess(message) {
    // Create success toast if it doesn't exist
    let successToast = document.getElementById('successToast');
    if (!successToast) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '5';
        
        toastContainer.innerHTML = `
            <div id="successToast" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body" id="successToastMessage">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        document.body.appendChild(toastContainer);
        successToast = document.getElementById('successToast');
    } else {
        document.getElementById('successToastMessage').textContent = message;
    }
    
    // Ensure Bootstrap is available
    const toast = new bootstrap.Toast(successToast);
    toast.show();
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login/register page
    const isLoginPage = window.location.pathname === '/index.html' || window.location.pathname === '/';
    
    if (isLoginPage) {
        // If user is already logged in, redirect to dashboard
        if (getToken()) {
            window.location.href = '/dashboard.html';
        }
    } else {
        // For other pages, require authentication
        if (!requireAuth()) return;
        
        // Update UI with user info
        updateUserUI();
    }
});