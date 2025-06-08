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
