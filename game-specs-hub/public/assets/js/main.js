// Configuration
const CONFIG = {
  API_KEY: "5716adb7564a465c8b0ace3f0d001d53", // Replace with your RAWG API key from https://rawg.io/apidocs
  BASE_URL: "https://api.rawg.io/api",
  ITEMS_PER_PAGE: 20,
}

// Global state
const state = {
  games: [],
  filteredGames: [],
  currentPage: 1,
  genres: [],
  platforms: [],
  isLoading: false,
  hasMore: true,
}

// DOM elements
const elements = {
  gamesGrid: document.getElementById("games-grid"),
  loading: document.getElementById("loading"),
  errorContainer: document.getElementById("error-container"),
  loadMoreBtn: document.getElementById("load-more"),
  searchOverlay: document.getElementById("search-overlay"),
  searchInput: document.getElementById("search-input"),
  gameModal: document.getElementById("game-modal"),
  toastContainer: document.getElementById("toast-container"),
}

// Initialize app
document.addEventListener("DOMContentLoaded", initializeApp)

async function initializeApp() {
  try {
    initializeTheme()

    // Only load games on homepage
    if (window.location.pathname === "/" || window.location.pathname.includes("index.html")) {
      showLoading(true)
      await Promise.all([loadGenres(), loadPlatforms(), loadGames()])
      animateStats()
      showLoading(false)
    }

    setupEventListeners()
  } catch (error) {
    console.error("Failed to initialize app:", error)
    showError("Failed to load the application. Please refresh the page.")
    showLoading(false)
  }
}

function setupEventListeners() {
  // Filter listeners
  const genreFilter = document.getElementById("genre-filter")
  const platformFilter = document.getElementById("platform-filter")
  const ratingFilter = document.getElementById("rating-filter")
  const yearFilter = document.getElementById("year-filter")

  if (genreFilter) genreFilter.addEventListener("change", applyFilters)
  if (platformFilter) platformFilter.addEventListener("change", applyFilters)
  if (ratingFilter) ratingFilter.addEventListener("change", applyFilters)
  if (yearFilter) yearFilter.addEventListener("change", applyFilters)

  // Search functionality
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", debounce(handleSearch, 300))
  }

  // Modal close on outside click
  if (elements.gameModal) {
    elements.gameModal.addEventListener("click", (e) => {
      if (e.target === elements.gameModal) {
        closeModal()
      }
    })
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboard)

  // Intersection Observer for animations
  setupIntersectionObserver()
}

// API Functions
async function loadGenres() {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/genres?key=${CONFIG.API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch genres")
    const data = await response.json()
    state.genres = data.results
    populateGenreFilter()
  } catch (error) {
    console.error("Error loading genres:", error)
    showError("Failed to load game genres.")
  }
}

async function loadPlatforms() {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/platforms?key=${CONFIG.API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch platforms")
    const data = await response.json()
    state.platforms = data.results
    populatePlatformFilter()
  } catch (error) {
    console.error("Error loading platforms:", error)
    showError("Failed to load game platforms.")
  }
}

async function loadGames(page = 1, append = false) {
  if (state.isLoading) return

  try {
    state.isLoading = true
    if (!append) showLoading(true)

    const response = await fetch(
      `${CONFIG.BASE_URL}/games?key=${CONFIG.API_KEY}&page=${page}&page_size=${CONFIG.ITEMS_PER_PAGE}&ordering=-rating`,
    )

    if (!response.ok) throw new Error("Failed to fetch games")
    const data = await response.json()

    const gamesWithSpecs = data.results.map((game) => ({
      ...game,
      systemRequirements: generateSystemRequirements(game),
    }))

    if (append) {
      state.games = [...state.games, ...gamesWithSpecs]
    } else {
      state.games = gamesWithSpecs
    }

    state.filteredGames = [...state.games]
    state.hasMore = !!data.next
    state.currentPage = page

    renderGames()
    updateLoadMoreButton()

    if (!append) showLoading(false)
  } catch (error) {
    console.error("Error loading games:", error)
    showError("Failed to load games. Please check your internet connection and API key.")
    if (!append) showLoading(false)
  } finally {
    state.isLoading = false
  }
}

async function loadGameDetails(gameId) {
  try {
    const [gameResponse, screenshotsResponse] = await Promise.all([
      fetch(`${CONFIG.BASE_URL}/games/${gameId}?key=${CONFIG.API_KEY}`),
      fetch(`${CONFIG.BASE_URL}/games/${gameId}/screenshots?key=${CONFIG.API_KEY}`),
    ])

    if (!gameResponse.ok || !screenshotsResponse.ok) {
      throw new Error("Failed to fetch game details")
    }

    const game = await gameResponse.json()
    const screenshots = await screenshotsResponse.json()

    return { game, screenshots: screenshots.results }
  } catch (error) {
    console.error("Error loading game details:", error)
    throw error
  }
}

// UI Functions
function populateGenreFilter() {
  const genreSelect = document.getElementById("genre-filter")
  if (!genreSelect) return

  state.genres.forEach((genre) => {
    const option = document.createElement("option")
    option.value = genre.id
    option.textContent = genre.name
    genreSelect.appendChild(option)
  })
}

function populatePlatformFilter() {
  const platformSelect = document.getElementById("platform-filter")
  if (!platformSelect) return

  state.platforms.forEach((platform) => {
    const option = document.createElement("option")
    option.value = platform.id
    option.textContent = platform.name
    platformSelect.appendChild(option)
  })
}

function renderGames() {
  if (!elements.gamesGrid) return

  if (state.filteredGames.length === 0) {
    elements.gamesGrid.innerHTML = `
            <div class="no-results">
                <div class="error-icon">🎮</div>
                <h3>No games found</h3>
                <p>Try adjusting your filters to see more results.</p>
            </div>
        `
    return
  }

  elements.gamesGrid.innerHTML = state.filteredGames
    .map(
      (game) => `
        <div class="game-card fade-in" onclick="openGameModal(${game.id})">
            <img src="${game.background_image || "/placeholder.svg?height=200&width=320"}" 
                 alt="${game.name}" 
                 class="game-image" 
                 loading="lazy"
                 onerror="this.src='/placeholder.svg?height=200&width=320'">
            <div class="game-content">
                <h3 class="game-title">${game.name}</h3>
                <div class="game-genre">${game.genres.map((g) => g.name).join(", ") || "Various"}</div>
                <div class="game-platforms">
                    ${game.platforms
                      .slice(0, 3)
                      .map((p) => `<span class="game-platform">${p.platform.name}</span>`)
                      .join("")}
                </div>
                <div class="game-rating">
                    <span class="rating-stars">${generateStars(game.rating || 0)}</span>
                    <span class="rating-score">${(game.rating || 0).toFixed(1)}</span>
                </div>
                <div class="system-requirements">
                    <h4>System Requirements</h4>
                    <div class="specs">
                        <div class="spec-item">
                            <span class="spec-label">RAM:</span>
                            <span class="spec-value">${game.systemRequirements.ram}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">CPU:</span>
                            <span class="spec-value">${game.systemRequirements.cpu.split("/")[0].trim()}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">GPU:</span>
                            <span class="spec-value">${game.systemRequirements.gpu.split("/")[0].trim()}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Storage:</span>
                            <span class="spec-value">${game.systemRequirements.storage}</span>
                        </div>
                    </div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); handleGameAction('${game.website || "#"}')">
                        ${game.website ? "Visit Site" : "View Details"}
                    </button>
                    <button class="btn btn-outline" onclick="event.stopPropagation(); openGameModal(${game.id})">
                        Details
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

async function openGameModal(gameId) {
  try {
    showLoading(true)
    const { game, screenshots } = await loadGameDetails(gameId)

    const gameSpecs = state.games.find((g) => g.id === gameId)?.systemRequirements || generateSystemRequirements(game)

    document.getElementById("modal-title").textContent = game.name
    document.getElementById("modal-body").innerHTML = `
            <img src="${game.background_image || "/placeholder.svg?height=300&width=800"}" 
                 alt="${game.name}" 
                 class="modal-image"
                 onerror="this.src='/placeholder.svg?height=300&width=800'">
            
            <div class="game-meta">
                <div class="meta-item">
                    <div class="meta-label">Rating</div>
                    <div class="meta-value">${(game.rating || 0).toFixed(1)}/5</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Released</div>
                    <div class="meta-value">${new Date(game.released).getFullYear()}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Playtime</div>
                    <div class="meta-value">${game.playtime || "N/A"} hours</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Metacritic</div>
                    <div class="meta-value">${game.metacritic || "N/A"}</div>
                </div>
            </div>
            
            <div class="game-description">
                <p>${game.description_raw || "No description available."}</p>
            </div>
            
            ${
              screenshots.length > 0
                ? `
                <div class="game-screenshots">
                    <h3>Screenshots</h3>
                    <div class="screenshots-grid">
                        ${screenshots
                          .slice(0, 6)
                          .map(
                            (screenshot) => `
                            <img src="${screenshot.image}" 
                                 alt="Screenshot" 
                                 class="screenshot" 
                                 onclick="openImageModal('${screenshot.image}')"
                                 loading="lazy">
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `
                : ""
            }
            
            <div class="detailed-specs">
                <h3>System Requirements</h3>
                <div class="specs-grid">
                    <div class="spec-category">
                        <h4>Minimum Requirements</h4>
                        <div class="spec-item">
                            <span class="spec-label">OS:</span>
                            <span class="spec-value">Windows 10 64-bit</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">RAM:</span>
                            <span class="spec-value">${gameSpecs.ram}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">CPU:</span>
                            <span class="spec-value">${gameSpecs.cpu}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">GPU:</span>
                            <span class="spec-value">${gameSpecs.gpu}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Storage:</span>
                            <span class="spec-value">${gameSpecs.storage}</span>
                        </div>
                    </div>
                    <div class="spec-category">
                        <h4>Platforms Available</h4>
                        ${game.platforms
                          .map(
                            (p) => `
                            <div class="spec-item">
                                <span class="spec-value">${p.platform.name}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            </div>
            
            <div class="game-actions">
                ${game.website ? `<a href="${game.website}" target="_blank" class="btn btn-primary">Visit Official Website</a>` : ""}
                ${game.reddit_url ? `<a href="${game.reddit_url}" target="_blank" class="btn btn-outline">Reddit Community</a>` : ""}
            </div>
        `

    elements.gameModal.classList.add("active")
    document.body.style.overflow = "hidden"
    showLoading(false)
  } catch (error) {
    console.error("Error opening game modal:", error)
    showError("Failed to load game details.")
    showLoading(false)
  }
}

function closeModal() {
  elements.gameModal.classList.remove("active")
  document.body.style.overflow = "auto"
}

// Filter Functions
function applyFilters() {
  const genreFilter = document.getElementById("genre-filter")?.value
  const platformFilter = document.getElementById("platform-filter")?.value
  const ratingFilter = document.getElementById("rating-filter")?.value
  const yearFilter = document.getElementById("year-filter")?.value

  state.filteredGames = state.games.filter((game) => {
    const genreMatch = !genreFilter || game.genres.some((g) => g.id == genreFilter)
    const platformMatch = !platformFilter || game.platforms.some((p) => p.platform.id == platformFilter)
    const ratingMatch = !ratingFilter || (game.rating || 0) >= Number.parseFloat(ratingFilter)
    const yearMatch = !yearFilter || new Date(game.released).getFullYear() == yearFilter

    return genreMatch && platformMatch && ratingMatch && yearMatch
  })

  renderGames()
}

function clearFilters() {
  const genreFilter = document.getElementById("genre-filter")
  const platformFilter = document.getElementById("platform-filter")
  const ratingFilter = document.getElementById("rating-filter")
  const yearFilter = document.getElementById("year-filter")

  if (genreFilter) genreFilter.value = ""
  if (platformFilter) platformFilter.value = ""
  if (ratingFilter) ratingFilter.value = ""
  if (yearFilter) yearFilter.value = ""

  state.filteredGames = [...state.games]
  renderGames()
  showToast("Filters cleared", "success")
}

// Search Functions
async function handleSearch(query) {
  if (!query.trim()) {
    const searchResults = document.getElementById("search-results")
    if (searchResults) searchResults.innerHTML = ""
    return
  }

  try {
    const response = await fetch(
      `${CONFIG.BASE_URL}/games?key=${CONFIG.API_KEY}&search=${encodeURIComponent(query)}&page_size=5`,
    )

    if (!response.ok) throw new Error("Search failed")
    const data = await response.json()

    const resultsHTML = data.results
      .map(
        (game) => `
            <div class="search-result-item" onclick="openGameModal(${game.id}); toggleSearch();">
                <img src="${game.background_image || "/placeholder.svg?height=50&width=50"}" alt="${game.name}">
                <div>
                    <h4>${game.name}</h4>
                    <p>${game.genres.map((g) => g.name).join(", ")}</p>
                </div>
            </div>
        `,
      )
      .join("")

    const searchResults = document.getElementById("search-results")
    if (searchResults) searchResults.innerHTML = resultsHTML
  } catch (error) {
    console.error("Search error:", error)
    showError("Search failed. Please try again.")
  }
}

// Utility Functions
function generateSystemRequirements(game) {
  const year = new Date(game.released).getFullYear()
  const rating = game.rating || 3
  const isNewGame = year >= 2020
  const isHighRated = rating >= 4.5

  let ramGB, cpu, gpu, storageGB

  if (isNewGame && isHighRated) {
    ramGB = Math.random() > 0.5 ? 16 : 12
    cpu = "Intel i7-9700K / AMD Ryzen 7 3700X"
    gpu = "RTX 3070 / RX 6700 XT"
    storageGB = Math.floor(Math.random() * 50) + 30
  } else if (isNewGame) {
    ramGB = Math.random() > 0.5 ? 8 : 12
    cpu = "Intel i5-8400 / AMD Ryzen 5 2600"
    gpu = "GTX 1660 / RX 580"
    storageGB = Math.floor(Math.random() * 30) + 20
  } else if (year >= 2015) {
    ramGB = Math.random() > 0.5 ? 8 : 4
    cpu = "Intel i5-6400 / AMD FX-8350"
    gpu = "GTX 1050 / RX 560"
    storageGB = Math.floor(Math.random() * 25) + 10
  } else {
    ramGB = Math.random() > 0.5 ? 4 : 2
    cpu = "Intel i3-4130 / AMD FX-6300"
    gpu = "GTX 750 Ti / R7 260X"
    storageGB = Math.floor(Math.random() * 15) + 5
  }

  return {
    ram: `${ramGB}GB`,
    cpu: cpu,
    gpu: gpu,
    storage: `${storageGB}GB`,
    ramValue: ramGB,
  }
}

function generateStars(rating) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return "★".repeat(fullStars) + (hasHalfStar ? "☆" : "") + "☆".repeat(emptyStars)
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// UI State Functions
function showLoading(show) {
  if (elements.loading) {
    elements.loading.style.display = show ? "flex" : "none"
  }
}

function showError(message) {
  if (elements.errorContainer) {
    const errorMessage = document.getElementById("error-message")
    if (errorMessage) errorMessage.textContent = message
    elements.errorContainer.style.display = "block"
    setTimeout(() => {
      elements.errorContainer.style.display = "none"
    }, 5000)
  } else {
    showToast(message, "error")
  }
}

function showToast(message, type = "info") {
  if (!elements.toastContainer) return

  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message

  elements.toastContainer.appendChild(toast)

  setTimeout(() => toast.classList.add("show"), 100)
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Event Handlers
function toggleSearch() {
  if (elements.searchOverlay) {
    elements.searchOverlay.classList.toggle("active")
    if (elements.searchOverlay.classList.contains("active") && elements.searchInput) {
      elements.searchInput.focus()
    }
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"
  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
  showToast(`Switched to ${newTheme} theme`, "success")
}

function toggleNav() {
  const navMenu = document.getElementById("nav-menu")
  if (navMenu) {
    navMenu.classList.toggle("active")
  }
}

function handleKeyboard(e) {
  if (e.key === "Escape") {
    if (elements.searchOverlay && elements.searchOverlay.classList.contains("active")) {
      toggleSearch()
    } else if (elements.gameModal && elements.gameModal.classList.contains("active")) {
      closeModal()
    }
  } else if (e.key === "/" && !e.target.matches("input, textarea")) {
    e.preventDefault()
    toggleSearch()
  }
}

function handleGameAction(url) {
  if (url && url !== "#") {
    window.open(url, "_blank")
  } else {
    showToast("No website available for this game", "info")
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({ behavior: "smooth" })
  }
}

function loadMoreGames() {
  loadGames(state.currentPage + 1, true)
}

function updateLoadMoreButton() {
  if (elements.loadMoreBtn) {
    elements.loadMoreBtn.style.display = state.hasMore ? "block" : "none"
  }
}

// Animation Functions
function animateStats() {
  const stats = document.querySelectorAll(".stat-number")
  stats.forEach((stat) => {
    const target = Number.parseInt(stat.getAttribute("data-count"))
    if (target) {
      animateNumber(stat, target)
    }
  })
}

function animateNumber(element, target) {
  let current = 0
  const increment = target / 100
  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current).toLocaleString()
  }, 20)
}

function setupIntersectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in")
        }
      })
    },
    { threshold: 0.1 },
  )

  // Observe elements that should animate on scroll
  document.querySelectorAll(".feature-card, .category-card").forEach((el) => {
    observer.observe(el)
  })
}

// Newsletter subscription
function subscribeNewsletter(e) {
  e.preventDefault()
  const email = e.target.querySelector('input[type="email"]').value

  // Simulate API call
  setTimeout(() => {
    showToast("Successfully subscribed to newsletter!", "success")
    e.target.reset()
  }, 1000)
}

// Initialize theme
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.setAttribute("data-theme", savedTheme)
}

// Image modal for screenshots
function openImageModal(imageSrc) {
  const imageModal = document.createElement("div")
  imageModal.className = "modal-overlay active"
  imageModal.innerHTML = `
        <div class="modal" style="max-width: 90vw; max-height: 90vh;">
            <div class="modal-header">
                <h2>Screenshot</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove(); document.body.style.overflow = 'auto';">×</button>
            </div>
            <div class="modal-body" style="padding: 0;">
                <img src="${imageSrc}" alt="Screenshot" style="width: 100%; height: auto; border-radius: 0 0 1rem 1rem;">
            </div>
        </div>
    `

  document.body.appendChild(imageModal)
  document.body.style.overflow = "hidden"

  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.remove()
      document.body.style.overflow = "auto"
    }
  })
}
document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('active');
    });
  }
});

// Make functions globally available
window.toggleSearch = toggleSearch
window.toggleTheme = toggleTheme
window.toggleNav = toggleNav
window.openGameModal = openGameModal
window.closeModal = closeModal
window.handleGameAction = handleGameAction
window.scrollToSection = scrollToSection
window.loadMoreGames = loadMoreGames
window.clearFilters = clearFilters
window.subscribeNewsletter = subscribeNewsletter
window.openImageModal = openImageModal
