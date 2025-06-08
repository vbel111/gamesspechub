// Low-spec games page functionality
const lowSpecState = {
  lowSpecGames: [],
  currentRAMFilter: "all",
  currentPage: 1,
  hasMore: true,
}

document.addEventListener("DOMContentLoaded", initializeLowSpecPage)

async function initializeLowSpecPage() {
  try {
    showLoading(true)
    await loadLowSpecGames()
    setupRAMFilters()
    showLoading(false)
  } catch (error) {
    console.error("Failed to initialize low-spec page:", error)
    showError("Failed to load low-spec games. Please refresh the page.")
    showLoading(false)
  }
}

async function loadLowSpecGames(page = 1, append = false) {
  try {
    // Load games from 2010-2018 which are more likely to be low-spec friendly
    const response = await fetch(
      `${CONFIG.BASE_URL}/games?key=${CONFIG.API_KEY}&dates=2010-01-01,2018-12-31&page=${page}&page_size=${CONFIG.ITEMS_PER_PAGE}&ordering=-rating`,
    )

    if (!response.ok) throw new Error("Failed to fetch low-spec games")
    const data = await response.json()

    // Filter and enhance games with low-spec requirements
    const lowSpecGamesWithSpecs = data.results
      .map((game) => ({
        ...game,
        systemRequirements: generateLowSpecRequirements(game),
      }))
      .filter((game) => game.systemRequirements.ramValue <= 6) // Only games with 6GB RAM or less

    if (append) {
      lowSpecState.lowSpecGames = [...lowSpecState.lowSpecGames, ...lowSpecGamesWithSpecs]
    } else {
      lowSpecState.lowSpecGames = lowSpecGamesWithSpecs
    }

    lowSpecState.hasMore = !!data.next
    lowSpecState.currentPage = page

    applyRAMFilter()
    updateLoadMoreLowSpecButton()
  } catch (error) {
    console.error("Error loading low-spec games:", error)
    throw error
  }
}

function generateLowSpecRequirements(game) {
  const year = new Date(game.released).getFullYear()
  const rating = game.rating || 3

  let ramGB, cpu, gpu, storageGB

  if (year >= 2015) {
    ramGB = Math.random() > 0.7 ? 6 : 4
    cpu = Math.random() > 0.5 ? "Intel i3-6100 / AMD FX-6300" : "Intel i5-4460 / AMD FX-8320"
    gpu = Math.random() > 0.5 ? "GTX 750 Ti / R7 260X" : "GTX 950 / RX 460"
    storageGB = Math.floor(Math.random() * 15) + 5
  } else if (year >= 2012) {
    ramGB = Math.random() > 0.6 ? 4 : 2
    cpu = "Intel i3-4130 / AMD FX-4300"
    gpu = "GTX 650 / HD 7770"
    storageGB = Math.floor(Math.random() * 10) + 3
  } else {
    ramGB = Math.random() > 0.5 ? 2 : 1
    cpu = "Intel Core 2 Duo / AMD Athlon X2"
    gpu = "GTX 460 / HD 5770"
    storageGB = Math.floor(Math.random() * 8) + 2
  }

  return {
    ram: `${ramGB}GB`,
    cpu: cpu,
    gpu: gpu,
    storage: `${storageGB}GB`,
    ramValue: ramGB,
  }
}

function setupRAMFilters() {
  const ramButtons = document.querySelectorAll(".ram-btn")
  ramButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      ramButtons.forEach((b) => b.classList.remove("active"))
      // Add active class to clicked button
      btn.classList.add("active")

      const ramValue = btn.getAttribute("data-ram")
      lowSpecState.currentRAMFilter = ramValue
      applyRAMFilter()
    })
  })
}

function applyRAMFilter() {
  let filteredGames = [...lowSpecState.lowSpecGames]

  if (lowSpecState.currentRAMFilter !== "all") {
    const maxRAM = Number.parseInt(lowSpecState.currentRAMFilter)
    filteredGames = filteredGames.filter((game) => game.systemRequirements.ramValue <= maxRAM)
  }

  renderLowSpecGames(filteredGames)
}

function renderLowSpecGames(games) {
  const lowSpecGamesGrid = document.getElementById("low-spec-games-grid")
  if (!lowSpecGamesGrid) return

  if (games.length === 0) {
    lowSpecGamesGrid.innerHTML = `
            <div class="no-results">
                <div class="error-icon">💻</div>
                <h3>No games found</h3>
                <p>No games found matching your RAM requirements. Try a higher RAM filter.</p>
            </div>
        `
    return
  }

  lowSpecGamesGrid.innerHTML = games
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
                    <h4>Low-Spec Requirements</h4>
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

function loadMoreLowSpecGames() {
  if (lowSpecState.hasMore) {
    loadLowSpecGames(lowSpecState.currentPage + 1, true)
  }
}

function updateLoadMoreLowSpecButton() {
  const loadMoreBtn = document.getElementById("load-more-low-spec")
  if (loadMoreBtn) {
    loadMoreBtn.style.display = lowSpecState.hasMore ? "block" : "none"
  }
}

// Make functions globally available
window.loadMoreLowSpecGames = loadMoreLowSpecGames
