// Contact page functionality
document.addEventListener("DOMContentLoaded", initializeContactPage)



function setupFAQToggles() {
  const questions = document.querySelectorAll('.faq-question');
  if (!questions.length) return;

  questions.forEach((question) => {
    // Hide all answers by default
    const answer = question.nextElementSibling;
    if (answer) answer.style.display = 'none';

    question.addEventListener('click', function () {
      const faqItem = question.parentElement;
      const answer = question.nextElementSibling;
      const toggle = question.querySelector('.faq-toggle');
      const isActive = faqItem.classList.toggle('active');
      if (answer) answer.style.display = isActive ? 'block' : 'none';
      if (toggle) toggle.textContent = isActive ? '−' : '+';
    });
  });
}

// Add this function for contact form handling
function setupContactForm() {
  const form = document.querySelector('#contact-form')
  if (!form) return

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    // Replace with your EmailJS service, template, and user IDs
    emailjs.sendForm('service_g2g3c3a', 'YOUR_TEMPLATE_ID', this, 'YOUR_USER_ID')
      .then(function () {
        alert('Message sent! We will reply to xelpap@gmail.com.')
        form.reset()
      }, function (error) {
        alert('Failed to send message. Please try again later.')
      })
  })
}
function initializeContactPage() {
  setupFAQToggles()
  setupContactForm() // <-- Add this line
}