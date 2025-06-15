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
    const toggle = question.querySelector('.faq-toggle')
    if (answer) {
      answer.style.display = 'none'
      answer.style.maxHeight = '0'
      answer.style.transition = 'max-height 0.3s ease-out'
    }
    if (toggle) {
      toggle.textContent = '+'
    }
  })

  questions.forEach((question) => {
    question.addEventListener('click', function () {
      // Toggle the 'active' class for styling
      this.classList.toggle('active')
      
      // Toggle the answer visibility with smooth animation
      const answer = this.nextElementSibling
      const toggle = this.querySelector('.faq-toggle')
      
      if (answer) {
        if (answer.style.display === 'block') {
          answer.style.maxHeight = '0'
          setTimeout(() => {
            answer.style.display = 'none'
          }, 300)
          if (toggle) toggle.textContent = '+'
        } else {
          answer.style.display = 'block'
          answer.style.maxHeight = answer.scrollHeight + 'px'
          if (toggle) toggle.textContent = '−'
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