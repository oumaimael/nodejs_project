// Global authentication state
let isAdmin = false;

// Simple admin credentials
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123"
};

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

// Initialize authentication
function initAuth() {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            document.getElementById("loginModal").style.display = "flex";
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
    
    // Initialize login form if it exists
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            
            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                login();
                document.getElementById("loginModal").style.display = "none";
                loginForm.reset();
            } else {
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
        cancelLogin.addEventListener("click", () => {
            document.getElementById("loginModal").style.display = "none";
        });
    }
    
    // Check initial admin status
    checkAdminStatus();
}