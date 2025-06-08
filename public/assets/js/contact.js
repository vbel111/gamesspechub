// Contact page functionality
document.addEventListener("DOMContentLoaded", initializeContactPage)

function initializeContactPage() {
  setupFAQToggles()
}

function setupFAQToggles() {
  // Select all FAQ question elements (adjust selector as needed)
  const questions = document.querySelectorAll('.faq-question')
  if (!questions.length) return

  questions.forEach((question) => {
    question.addEventListener('click', function () {
      // Toggle the 'active' class for styling
      this.classList.toggle('active')
      // Toggle the answer visibility (assumes answer is next sibling)
      const answer = this.nextElementSibling
      if (answer) {
        answer.style.display = answer.style.display === 'block' ? 'none' : 'block'
      }
    })
  })
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