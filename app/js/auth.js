// Global authentication state
let isAdmin = false;

let ADMIN_CREDENTIALS = [];

// Track if auth is initialized to prevent duplicate event listeners
let authInitialized = false;

// Fetch admin users from API
async function fetchAdminUsers() {
    try {
        const response = await fetch('http://localhost:5000/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        ADMIN_CREDENTIALS = await response.json();
        console.log('Admin users loaded:', ADMIN_CREDENTIALS);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        ADMIN_CREDENTIALS = [];
    }
}

// Check admin status from localStorage
function checkAdminStatus() {
    const savedAdmin = localStorage.getItem('isAdmin');
    if (savedAdmin === 'true') {
        isAdmin = true;
    }
    updateAdminUI();
}

// Update UI based on admin status
function updateAdminUI() {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (loginBtn) loginBtn.style.display = isAdmin ? "none" : "block";
    if (logoutBtn) logoutBtn.style.display = isAdmin ? "block" : "none";
    
    // Update admin-only elements
    document.querySelectorAll(".admin-only").forEach(el => {
        if (isAdmin) {
            el.classList.add("visible");
        } else {
            el.classList.remove("visible");
        }
    });
    
    // Update action buttons in cat cards
    updateActionButtons();
}

// Update action buttons visibility
function updateActionButtons() {
    const actionContainers = document.querySelectorAll(".actions");
    actionContainers.forEach(actions => {
        if (!isAdmin) {
            actions.style.display = "none";
        } else {
            actions.style.display = "flex";
        }
    });
}

// Login function
function login() {
    isAdmin = true;
    localStorage.setItem('isAdmin', 'true');
    updateAdminUI();
    if (typeof showPopup === 'function') {
        showPopup("Admin login successful!");
    } else {
        alert("Admin login successful!");
    }
}

// Logout function
function logout() {
    isAdmin = false;
    localStorage.removeItem('isAdmin');
    updateAdminUI();
    if (typeof showPopup === 'function') {
        showPopup("Logged out successfully");
    } else {
        alert("Logged out successfully");
    }
}

// Validate login credentials against fetched admin users
function validateLogin(username, password) {
    if (!Array.isArray(ADMIN_CREDENTIALS)) {
        console.error('ADMIN_CREDENTIALS is not an array:', ADMIN_CREDENTIALS);
        return false;
    }
    
    const validUser = ADMIN_CREDENTIALS.find(user => 
        user.userName === username && user.password === password
    );
    
    return validUser !== undefined;
}

// Initialize authentication - FIXED to prevent duplicate event listeners
async function initAuth() {
    // Prevent multiple initializations
    if (authInitialized) {
        console.log('Auth already initialized, skipping...');
        return;
    }
    
    authInitialized = true;
    
    // First, fetch admin users from API
    await fetchAdminUsers();
    
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (loginBtn) {
        // Remove any existing event listeners first
        loginBtn.replaceWith(loginBtn.cloneNode(true));
        const newLoginBtn = document.getElementById("loginBtn");
        
        newLoginBtn.addEventListener("click", () => {
            document.getElementById("loginModal").style.display = "flex";
        });
    }
    
    if (logoutBtn) {
        // Remove any existing event listeners first
        logoutBtn.replaceWith(logoutBtn.cloneNode(true));
        const newLogoutBtn = document.getElementById("logoutBtn");
        
        newLogoutBtn.addEventListener("click", logout);
    }
    
    // Initialize login form if it exists
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        // Remove any existing event listeners first
        loginForm.replaceWith(loginForm.cloneNode(true));
        const newLoginForm = document.getElementById("loginForm");
        
        newLoginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            
            console.log('Login attempt:', { username, password });
            console.log('Available credentials:', ADMIN_CREDENTIALS);
            
            if (validateLogin(username, password)) {
                console.log('Login successful!');
                login();
                document.getElementById("loginModal").style.display = "none";
                newLoginForm.reset();
            } else {
                console.log('Login failed - invalid credentials');
                if (typeof showPopup === 'function') {
                    showPopup("Invalid username or password");
                } else {
                    alert("Invalid username or password");
                }
            }
        });
    }
    
    // Initialize login cancel button
    const cancelLogin = document.getElementById("cancelLogin");
    if (cancelLogin) {
        // Remove any existing event listeners first
        cancelLogin.replaceWith(cancelLogin.cloneNode(true));
        const newCancelLogin = document.getElementById("cancelLogin");
        
        newCancelLogin.addEventListener("click", () => {
            document.getElementById("loginModal").style.display = "none";
        });
    }
    
    // Check initial admin status
    checkAdminStatus();
}

// Make sure to call initAuth() when your page loads
document.addEventListener('DOMContentLoaded', initAuth);