// Initialize contact page
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initContactForm();
    highlightCurrentPage();
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

// Initialize contact form
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
        
        // Validate required fields
        if (!formData.purpose) {
            alert('Please select a reason for contacting us.');
            return;
        }
        
        if (!formData.name || !formData.email || !formData.message) {
            alert('Please fill in all required fields (Name, Email, Message).');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // In a real application, this would send to a server
        // For now, we'll simulate success
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

// Simulate form submission (in real app, this would be a fetch request)
function simulateFormSubmission(formData) {
    // Show loading state
    const submitBtn = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        alert(`Thank you, ${formData.name}! Your message has been received.\n\nWe will contact you at ${formData.email} within 24-48 hours regarding your ${formData.purpose} inquiry.`);
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Log to console (for debugging)
        console.log('Form submitted:', formData);
        
        // In a real application, you would send this to your server:
        /*
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            alert('Thank you! Your message has been sent.');
            document.getElementById('contactForm').reset();
        })
        .catch(error => {
            alert('Sorry, there was an error sending your message. Please try again or call us.');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
        */
        
    }, 1500);
}

// Add some dynamic behavior for emergency notice
document.addEventListener('DOMContentLoaded', () => {
    const emergencyNotice = document.querySelector('.emergency-notice');
    if (emergencyNotice) {
        emergencyNotice.addEventListener('click', () => {
            if (confirm('For immediate emergency assistance, call our 24/7 line: (555) 911-CATS\n\nCall now?')) {
                window.location.href = 'tel:+15559112287';
            }
        });
    }
});