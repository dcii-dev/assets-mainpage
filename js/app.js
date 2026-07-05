(function () {
  "use strict";

  /** @type {!Array<!Object>} */
  const TOOLS = [
    {
      name: "CSS Clamp Generator",
      category: "Web Development",
      description:
        "Generate CSS clamp() declarations for fluid typography and spacing. Supports viewport and container query units plus full type scale generation.",
      tags: ["css", "typography", "responsive", "clamp"],
      url: "https://clampgen.com/",
    },
    {
      name: "Freelance Rate Calculator",
      category: "Business",
      description:
        "Calculate your true freelance hourly rate factoring in non-billable hours, taxes, overhead, and expenses.",
      tags: ["freelance", "finance", "hourly rate", "pricing"],
      url: "https://freelanceratewise.com/",
    },
    {
      name: "Macro Calculator",
      category: "Fitness",
      description:
        "Calculate BMR, TDEE, daily macro targets, body fat percentage, and heart rate training zones.",
      tags: ["nutrition", "macros", "tdee", "bmr"],
      url: "https://calmacrocal.com/",
    },
    {
      name: "One Rep Max Calculator",
      category: "Fitness",
      description:
        "Estimate your 1RM from three proven formulas. Includes warm-up ramp, competition attempts, and PR history tracking.",
      tags: ["strength", "1rm", "training", "powerlifting"],
      url: "https://onerepmaxx.com/",
    },
    {
      name: "Srcset Builder",
      category: "Web Development",
      description:
        "Build responsive image srcset and sizes attributes from your target breakpoints. Copy production-ready markup in one click.",
      tags: ["images", "responsive", "performance", "srcset"],
      url: "https://srcsetbuilder.com/",
    },
    {
      name: "CSS Layout Generator",
      category: "Web Development",
      description:
        "Visual CSS Grid, Subgrid, and Flexbox layout builder with templates, drag-resize controls, and code output.",
      tags: ["grid", "flexbox", "layout", "generator"],
      url: "https://csslayoutgen.com/",
    },
  ];

  /**
   * Returns all distinct categories from tool data.
   * @return {!Array<string>} Sorted category names.
   */
  function getCategories() {
    const categories = TOOLS.map((tool) => tool.category);
    return [...new Set(categories)].sort();
  }

  /**
   * Creates and renders category filter chips.
   * @param {!HTMLElement} container Parent element for chips.
   */
  function renderCategoryChips(container) {
    const categories = ["All", ...getCategories()];

    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = "toolbar__chip";
      button.type = "button";
      button.dataset.category = category;
      button.setAttribute("aria-pressed", "false");
      button.textContent = category;
      container.append(button);
    });

    const allChip = container.querySelector('[data-category="All"]');
    if (allChip) {
      allChip.classList.add("is-active");
      allChip.setAttribute("aria-pressed", "true");
    }
  }

  /**
   * Checks whether a tool matches current filters.
   * @param {!Object} tool Tool data object.
   * @param {string} activeCategory Active category filter.
   * @param {string} query Lowercase search string.
   * @return {boolean} True when tool should be shown.
   */
  function isToolMatch(tool, activeCategory, query) {
    const matchesCategory =
      activeCategory === "All" || tool.category === activeCategory;

    const searchBlob = [
      tool.name,
      tool.category,
      tool.description,
      tool.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || searchBlob.includes(query);
    return matchesCategory && matchesQuery;
  }

  /**
   * Returns card HTML for a single tool.
   * @param {!Object} tool Tool data object.
   * @return {string} HTML string.
   */
  function getToolCardMarkup(tool) {
    const tagMarkup = tool.tags
      .map((tag) => `<span class="tool-card__tag">${tag}</span>`)
      .join("");

    return `
      <article class="tool-card" aria-label="${tool.name}">
        <h3 class="tool-card__name">${tool.name}</h3>
        <p class="tool-card__meta">${tool.category}</p>
        <p class="tool-card__description">${tool.description}</p>
        <div class="tool-card__tags" aria-label="Keywords">${tagMarkup}</div>
        <a class="tool-card__cta" href="${tool.url}" target="_blank" rel="noopener">
          Open tool
        </a>
      </article>
    `;
  }

  /**
   * Renders filtered tool cards and updates count.
   * @param {!HTMLElement} grid Card container.
   * @param {!HTMLElement} countEl Result count element.
   * @param {!HTMLElement} emptyEl Empty-state element.
   * @param {string} category Active category.
   * @param {string} query Current search query.
   */
  function renderTools(grid, countEl, emptyEl, category, query) {
    const matches = TOOLS.filter((tool) => isToolMatch(tool, category, query));
    grid.innerHTML = matches.map(getToolCardMarkup).join("");

    const plural = matches.length === 1 ? "tool" : "tools";
    countEl.textContent = `${matches.length} ${plural} shown`;
    emptyEl.hidden = matches.length > 0;
  }

  /**
   * Sets the footer year to the current year.
   */
  function setFooterYear() {
    const yearEl = document.getElementById("footer-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /**
   * Applies a theme to the document and updates the toggle button state.
   * @param {"light"|"dark"} theme
   */
  function applyTheme(theme) {
    const btn = document.getElementById("theme-toggle");
    document.documentElement.setAttribute("data-theme", theme);

    if (btn) {
      const isDark = theme === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode",
      );
    }
  }

  /**
   * Initializes the theme from localStorage, falling back to the
   * user's OS preference, then light mode.
   */
  function initializeTheme() {
    const stored = localStorage.getItem("otherusefultools-theme");

    if (stored === "dark" || stored === "light") {
      applyTheme(stored);
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  /**
   * Toggles between light and dark mode and persists the choice.
   */
  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("otherusefultools-theme", next);
  }

  /**
   * Initializes the hub page.
   */
  function initializeApp() {
    const grid = document.getElementById("tool-grid");
    const countEl = document.getElementById("result-count");
    const emptyEl = document.getElementById("empty-state");
    const searchInput = document.getElementById("tool-search");
    const chipContainer = document.getElementById("category-chips");
    const themeToggleBtn = document.getElementById("theme-toggle");

    if (!grid || !countEl || !emptyEl || !searchInput || !chipContainer) {
      return;
    }

    setFooterYear();
    initializeTheme();
    renderCategoryChips(chipContainer);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", toggleTheme);
    }

    let activeCategory = "All";
    let query = "";

    renderTools(grid, countEl, emptyEl, activeCategory, query);

    searchInput.addEventListener("input", () => {
      query = searchInput.value.trim().toLowerCase();
      renderTools(grid, countEl, emptyEl, activeCategory, query);
    });

    chipContainer.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }

      const nextCategory = target.dataset.category;
      if (!nextCategory) {
        return;
      }

      activeCategory = nextCategory;

      const chips = chipContainer.querySelectorAll(".toolbar__chip");
      chips.forEach((chip) => {
        chip.classList.remove("is-active");
        chip.setAttribute("aria-pressed", "false");
      });

      target.classList.add("is-active");
      target.setAttribute("aria-pressed", "true");

      renderTools(grid, countEl, emptyEl, activeCategory, query);
    });
  }

  if (document.readyState === "complete") {
    initializeApp();
  } else {
    window.addEventListener("load", initializeApp, { once: true });
  }
})();
