// --- Mobile Navigation Toggle and Smooth Scrolling (No changes needed here) ---
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = mobileMenu.querySelectorAll('a');
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('nav').offsetHeight;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetElement.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - headerHeight;

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // --- Form Validation and AJAX Submission (NEW BLOCK) ---
    
    // Get the Formspree URL from the HTML action attribute
    const formspreeUrl = contactForm.action;

    contactForm.addEventListener('submit', async function (e) {
        // Prevent the default browser submission/redirect
        e.preventDefault(); 
        let isValid = true;

        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');

        // Clear previous errors
        document.querySelectorAll('.text-red-500').forEach(el => el.classList.add('hidden'));

        // Validation Checks
        if (name.value.trim() === "") {
            document.getElementById('nameError').classList.remove('hidden');
            isValid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) {
            document.getElementById('emailError').classList.remove('hidden');
            isValid = false;
        }

        if (message.value.trim() === "") {
            document.getElementById('messageError').classList.remove('hidden');
            isValid = false;
        }

        if (isValid) {
            // 1. Display "Sending..." status
            formStatus.textContent = 'Sending message... Please wait.';
            formStatus.classList.remove('hidden', 'text-red-500');
            formStatus.classList.add('text-green-600');
            
            // 2. Prepare data for submission
            const formData = new FormData(contactForm);
            
            try {
                // 3. Use the fetch API to submit silently to Formspree
                const response = await fetch(formspreeUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Essential for Formspree AJAX
                    }
                });

                if (response.ok) {
                    // Success! Display custom message
                    formStatus.textContent = 'Mail has been sent successfully! Thank you.';
                    contactForm.reset(); // Clear the form fields
                    setTimeout(() => {
                        formStatus.classList.add('hidden');
                    }, 5000);
                } else {
                    // Formspree returned an error (e.g., rate limit)
                    const data = await response.json();
                    let errorMessage = data.error ? data.error : 'An unexpected error occurred.';
                    
                    formStatus.textContent = 'Submission Failed: ' + errorMessage;
                    formStatus.classList.remove('text-green-600');
                    formStatus.classList.add('text-red-500');
                }
            } catch (error) {
                // Network or other critical error
                formStatus.textContent = 'Submission Failed: Could not connect to server.';
                formStatus.classList.remove('text-green-600');
                formStatus.classList.add('text-red-500');
                console.error(error);
            }

        } else {
            // Validation failed, display local errors
            formStatus.textContent = 'Please correct the errors above.';
            formStatus.classList.remove('hidden', 'text-green-600');
            formStatus.classList.add('text-red-500');
        }
    });
});