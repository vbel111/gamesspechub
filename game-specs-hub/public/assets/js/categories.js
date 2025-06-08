// Categories page specific functionality
const categoryState = {
  categories: [],
  selectedCategory: null,
  categoryGames: [],
  categoryPage: 1,
  hasMoreCategoryGames: true,
}

document.addEventListener("DOMContentLoaded", initializeCategoriesPage)

async function initializeCategoriesPage() {
  try {
    showLoading(true)
    await loadCategoriesData()
    renderCategoriesGrid()
    checkURLParams()
    showLoading(false)
  } catch (error) {
    console.error("Failed to initialize categories page:", error)
    showError("Failed to load categories. Please refresh the page.")
    showLoading(false)
  }
}

async function loadCategoriesData() {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/genres?key=${CONFIG.API_KEY}`)
    if (!response.ok) throw new Error("Failed to fetch categories")
    const data = await response.json()
    categoryState.categories = data.results
  } catch (error) {
    console.error("Error loading categories:", error)
    throw error
  }
}

function renderCategoriesGrid() {
  const categoriesGrid = document.getElementById("categories-grid")
  if (!categoriesGrid) return

  const categoryIcons = {
    Action: "⚔️",
    Adventure: "🗺️",
    RPG: "🗡️",
    Strategy: "🧠",
    Shooter: "🔫",
    Puzzle: "🧩",
    Racing: "🏎️",
    Sports: "⚽",
    Simulation: "🎮",
    Platformer: "🦘",
    Fighting: "👊",
    Arcade: "🕹️",
    Indie: "💎",
    Casual: "😊",
    Family: "👨‍👩‍👧‍👦",
    Educational: "📚",
    "Board Games": "🎲",
    Card: "🃏",
    "Massively Multiplayer": "🌐",
    Music: "🎵",
  }

  categoriesGrid.innerHTML = categoryState.categories
    .map(
      (category) => `
        <div class="category-detailed-card" onclick="selectCategory(${category.id}, '${category.name}')">
            <div class="category-header">
                <div class="category-icon">${categoryIcons[category.name] || "🎮"}</div>
                <h3>${category.name}</h3>
                <p>${category.games_count} games</p>
            </div>
            <div class="category-content">
                <div class="category-stats">
                    <div class="category-stat">
                        <span class="category-stat-number">${category.games_count}</span>
                        <span class="category-stat-label">Total Games</span>
                    </div>
                    <div class="category-stat">
                        <span class="category-stat-number">${Math.floor(Math.random() * 50) + 10}</span>
                        <span class="category-stat-label">New This Month</span>
                    </div>
                </div>
                <p>Discover amazing ${category.name.toLowerCase()} games that match your system specifications.</p>
                <button class="btn btn-primary" onclick="event.stopPropagation(); selectCategory(${category.id}, '${category.name}')">
                    Explore Games
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

async function selectCategory(categoryId, categoryName) {
  try {
    categoryState.selectedCategory = { id: categoryId, name: categoryName }
    categoryState.categoryPage = 1
    categoryState.hasMoreCategoryGames = true

    showLoading(true)
    await loadCategoryGames(categoryId)

    // Update UI
    document.getElementById("category-title").textContent = `${categoryName} Games`
    document.getElementById("category-description").textContent =
      `Discover the best ${categoryName.toLowerCase()} games for your system`
    document.getElementById("category-games").style.display = "block"

    // Scroll to games section
    document.getElementById("category-games").scrollIntoView({ behavior: "smooth" })

    showLoading(false)
  } catch (error) {
    console.error("Error selecting category:", error)
    showError("Failed to load category games.")
    showLoading(false)
  }
}

async function loadCategoryGames(categoryId, page = 1, append = false) {
  try {
    const response = await fetch(
      `${CONFIG.BASE_URL}/games?key=${CONFIG.API_KEY}&genres=${categoryId}&page=${page}&page_size=${CONFIG.ITEMS_PER_PAGE}&ordering=-rating`,
    )

    if (!response.ok) throw new Error("Failed to fetch category games")
    const data = await response.json()

    const gamesWithSpecs = data.results.map((game) => ({
      ...game,
      systemRequirements: generateSystemRequirements(game),
    }))

    if (append) {
      categoryState.categoryGames = [...categoryState.categoryGames, ...gamesWithSpecs]
    } else {
      categoryState.categoryGames = gamesWithSpecs
    }

    categoryState.hasMoreCategoryGames = !!data.next
    categoryState.categoryPage = page

    renderCategoryGames()
    updateLoadMoreCategoryButton()
  } catch (error) {
    console.error("Error loading category games:", error)
    throw error
  }
}

function renderCategoryGames() {
  const categoryGamesGrid = document.getElementById("category-games-grid")
  if (!categoryGamesGrid) return

  if (categoryState.categoryGames.length === 0) {
    categoryGamesGrid.innerHTML = `
            <div class="no-results">
                <div class="error-icon">🎮</div>
                <h3>No games found</h3>
                <p>No games found in this category.</p>
            </div>
        `
    return
  }

  categoryGamesGrid.innerHTML = categoryState.categoryGames
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

function loadMoreCategoryGames() {
  if (categoryState.selectedCategory && categoryState.hasMoreCategoryGames) {
    loadCategoryGames(categoryState.selectedCategory.id, categoryState.categoryPage + 1, true)
  }
}

function updateLoadMoreCategoryButton() {
  const loadMoreBtn = document.getElementById("load-more-category")
  if (loadMoreBtn) {
    loadMoreBtn.style.display = categoryState.hasMoreCategoryGames ? "block" : "none"
  }
}

function checkURLParams() {
  const urlParams = new URLSearchParams(window.location.search)
  const genreParam = urlParams.get("genre")

  if (genreParam) {
    const category = categoryState.categories.find(
      (cat) => cat.name.toLowerCase() === genreParam.toLowerCase()
    )
    if (category) {
      selectCategory(category.id, category.name)
    }
  }
}

// Make functions globally available
window.selectCategory = selectCategory
window.loadMoreCategoryGames = loadMoreCategoryGames
// If you use these in your HTML, uncomment the following lines:
// window.openGameModal = openGameModal
// window.handleGameAction = handleGameAction
