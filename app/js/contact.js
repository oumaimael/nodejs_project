// Initialize contact page
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initPopups(); 
    initContactForm();
    highlightCurrentPage();
    initEmergencyNotice();
});


// Highlight current page in navbar
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize contact form - UPDATED to use your popup system
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            purpose: document.querySelector('input[name="contact-purpose"]:checked')?.value,
            name: document.getElementById('contact-name').value.trim(),
            email: document.getElementById('contact-email').value.trim(),
            phone: document.getElementById('contact-phone').value.trim(),
            city: document.getElementById('contact-city').value.trim(),
            message: document.getElementById('contact-message').value.trim(),
            catInfo: document.getElementById('contact-cat').value.trim()
        };
        
        // Validate required fields - using your showPopup function
        if (!formData.purpose) {
            showPopup('Please select a reason for contacting us.');
            return;
        }
        
        if (!formData.name || !formData.email || !formData.message) {
            showPopup('Please fill in all required fields (Name, Email, Message).');
            return;
        }
        
        // Email validation - using your showPopup function
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showPopup('Please enter a valid email address.');
            return;
        }
        
        // Simulate form submission
        simulateFormSubmission(formData);
    });
    
    // Add event listeners for radio buttons to show/hide additional fields
    const purposeRadios = document.querySelectorAll('input[name="contact-purpose"]');
    purposeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateFormBasedOnPurpose(radio.value);
        });
    });
}

// Update form based on selected purpose
function updateFormBasedOnPurpose(purpose) {
    const catField = document.getElementById('contact-cat');
    const messageField = document.getElementById('contact-message');
    
    // Reset placeholder/guidance
    messageField.placeholder = "Please provide details about your inquiry...";
    
    switch(purpose) {
        case 'adoption':
            catField.placeholder = "Enter the name(s) of the cat(s) you're interested in";
            messageField.placeholder = "Tell us about your home, family, and experience with cats...";
            break;
        case 'surrender':
            catField.placeholder = "Cat's name, age, breed, and reason for surrender";
            messageField.placeholder = "Please explain your situation and why you need to surrender...";
            break;
        case 'report':
            catField.placeholder = "Location, description, and condition of the cat";
            messageField.placeholder = "When/where did you see the cat? Any urgent concerns?";
            break;
        case 'volunteer':
            messageField.placeholder = "What type of volunteering are you interested in? Any relevant experience?";
            break;
        case 'donate':
            messageField.placeholder = "What would you like to donate? Any specific preferences?";
            break;
    }
}

function simulateFormSubmission(formData) {
    // Show loading state
    const submitBtn = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        const successMessage = `Thank you, ${formData.name}! Your message has been received.\n\nWe will contact you at ${formData.email} within 24-48 hours regarding your ${formData.purpose} inquiry.`;
        
        const successDiv = document.getElementById('successMessage');
        const successContent = document.getElementById('successMessageContent');
        
        if (successDiv && successContent) {
            successContent.textContent = successMessage;
            successDiv.style.display = 'block';
            successDiv.classList.add('show');
            
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            setTimeout(() => {
                successDiv.classList.remove('show');
                setTimeout(() => {
                    successDiv.style.display = 'none';
                }, 500);
            }, 10000);
        } else {
            showPopup(successMessage);
        }
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        console.log('Form submitted:', formData);
        
    }, 1500); 
}

// Initialize emergency notice 
function initEmergencyNotice() {
    const emergencyNotice = document.querySelector('.emergency-notice');
    if (emergencyNotice) {
        emergencyNotice.addEventListener('click', () => {
            showConfirm('For immediate emergency assistance, call our 24/7 line: (555) 911-CATS\n\nCall now?')
                .then(result => {
                    if (result) {
                        window.location.href = 'tel:+212522123456';
                    }
                });
        });
    }
}

// Initialize authentication (if needed)
function initAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple authentication - replace with real authentication
            if (username === 'admin' && password === 'password') {
                showPopup('Login successful!');
                document.getElementById('loginModal').style.display = 'none';
            } else {
                showPopup('Invalid username or password');
            }
        });
    }
    
    const cancelLogin = document.getElementById('cancelLogin');
    if (cancelLogin) {
        cancelLogin.addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'none';
        });
    }
}