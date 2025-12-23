// Global authentication state
let isAdmin = false;

// Track if auth is initialized to prevent duplicate event listeners
let authInitialized = false;

// Check session status from server
async function checkSession() {
    try {
        // Check if user is stored in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    isAdmin = true;
                    updateAdminUI();
                    return;
                }
            } catch (e) {
                console.error('Invalid user data in localStorage:', e);
                localStorage.removeItem('user');
            }
        }
        
        isAdmin = false;
        updateAdminUI();
    } catch (error) {
        console.error('Session check failed:', error);
        isAdmin = false;
        updateAdminUI();
    }
}

// Check admin status from localStorage (Legacy - removed)
function checkAdminStatus() {
    // Legacy function kept for structure but now delegates to checkSession or does nothing
    // checkSession is called in initAuth
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

// Login success handler
function onLoginSuccess() {
    isAdmin = true;
    updateAdminUI();
    showPopup("Login successful!");
}

// Logout function
async function logout() {
    try {
        // Remove user from localStorage
        localStorage.removeItem('user');
        
        // Update UI
        isAdmin = false;
        updateAdminUI();
        showPopup("Logged out successfully");
    } catch (error) {
        console.error('Logout error:', error);
        showPopup("Error logging out");
    }
}

// Initialize authentication
async function initAuth() {
    // Prevent multiple initializations
    if (authInitialized) {
        return;
    }

    authInitialized = true;

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

        newLoginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch(`${API_BASE_URL}/api/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userName: username, password: password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Store user info in localStorage
                    localStorage.setItem('user', JSON.stringify(data));
                    onLoginSuccess();
                    document.getElementById("loginModal").style.display = "none";
                    newLoginForm.reset();
                } else {
                    console.error('Login failed:', data);
                    showPopup(data.error || "Invalid username or password");
                }
            } catch (error) {
                console.error('Login error:', error);
                showPopup("An error occurred during login.");
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

    // Initialize Sign Up Button
    const signupBtn = document.getElementById("signupBtn");
    if (signupBtn) {
        signupBtn.replaceWith(signupBtn.cloneNode(true));
        const newSignupBtn = document.getElementById("signupBtn");

        newSignupBtn.addEventListener("click", () => {
            document.getElementById("signupModal").style.display = "flex";
        });
    }

    // Initialize Sign Up Form
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.replaceWith(signupForm.cloneNode(true));
        const newSignupForm = document.getElementById("signupForm");

        newSignupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const userName = document.getElementById("signupUsername").value;
            const email = document.getElementById("signupEmail").value;
            const password = document.getElementById("signupPassword").value;

            try {
                const response = await fetch(`${API_BASE_URL}/api/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userName, email, password })
                });

                if (response.ok) {
                    showPopup("Sign up successful! You can now login.");
                    document.getElementById("signupModal").style.display = "none";
                    newSignupForm.reset();
                    // Refresh admin users list to include the new user
                    // await fetchAdminUsers();
                } else {
                    const data = await response.json();
                    showPopup("Sign up failed: " + (data.error || "Unknown error"));
                }
            } catch (error) {
                console.error('Error signing up:', error);
                showPopup("An error occurred during sign up.");
            }
        });
    }

    // Initialize Sign Up Cancel Button
    const cancelSignup = document.getElementById("cancelSignup");
    if (cancelSignup) {
        cancelSignup.replaceWith(cancelSignup.cloneNode(true));
        const newCancelSignup = document.getElementById("cancelSignup");

        newCancelSignup.addEventListener("click", () => {
            document.getElementById("signupModal").style.display = "none";
        });
    }

    // Check session on load
    await checkSession();
}

// Make sure to call initAuth() when your page loads
document.addEventListener('DOMContentLoaded', initAuth);

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navItems = navLinks.querySelectorAll('.nav-link, .nav-login, .nav-logout');
        navItems.forEach(item => {
            item.addEventListener('click', function () {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
});