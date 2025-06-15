// Contact page functionality
document.addEventListener("DOMContentLoaded", initializeContactPage)

function initializeContactPage() {
  setupFAQToggles()
  setupContactForm()
}

function setupFAQToggles() {
  // Select all FAQ question elements
  const questions = document.querySelectorAll('.faq-question')
  if (!questions.length) return

  // Set initial state - hide all answers
  questions.forEach((question) => {
    const answer = question.nextElementSibling
    if (answer) {
      answer.style.display = 'none'
    }
  })

  questions.forEach((question) => {
    question.addEventListener('click', function () {
      // Toggle the 'active' class for styling
      this.classList.toggle('active')
      
      // Toggle the answer visibility with smooth animation
      const answer = this.nextElementSibling
      if (answer) {
        if (answer.style.display === 'block') {
          answer.style.display = 'none'
          answer.style.maxHeight = '0'
        } else {
          answer.style.display = 'block'
          answer.style.maxHeight = answer.scrollHeight + 'px'
        }
      }
    })
  })
}

// Contact form handling
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