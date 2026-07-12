(function () {
  "use strict";

  /** @type {!Array<!Object>} */
  const TOOLS = [
    {
      name: "CSS Clamp Generator",
      categories: ["Web Development", "CSS", "Web Performance"],
      description:
        "Generate CSS clamp() declarations for fluid typography and spacing. Supports viewport and container query units plus full type scale generation.",
      tags: ["css", "typography", "responsive", "clamp"],
      url: "https://clampgen.com/",
    },
    {
      name: "Freelance Rate Calculator",
      categories: ["Business"],
      description:
        "Calculate your true freelance hourly rate factoring in non-billable hours, taxes, overhead, and expenses.",
      tags: ["freelance", "finance", "hourly rate", "pricing"],
      url: "https://freelanceratewise.com/",
    },
    {
      name: "Macro Calculator",
      categories: ["Fitness"],
      description:
        "Calculate BMR, TDEE, daily macro targets, body fat percentage, and heart rate training zones.",
      tags: ["nutrition", "macros", "tdee", "bmr"],
      url: "https://calmacrocal.com/",
    },
    {
      name: "One Rep Max Calculator",
      categories: ["Fitness"],
      description:
        "Estimate your 1RM from three proven formulas. Includes warm-up ramp, competition attempts, and PR history tracking.",
      tags: ["strength", "1rm", "training", "powerlifting"],
      url: "https://onerepmaxx.com/",
    },
    {
      name: "Srcset Builder",
      categories: ["Web Development", "Web Performance"],
      description:
        "Build responsive image srcset and sizes attributes from your target breakpoints. Copy production-ready markup in one click.",
      tags: ["images", "responsive", "performance", "srcset"],
      url: "https://srcsetbuilder.com/",
    },
    {
      name: "CSS Layout Generator",
      categories: ["Web Development", "CSS"],
      description:
        "Visual CSS Grid, Subgrid, and Flexbox layout builder with templates, drag-resize controls, and code output.",
      tags: ["grid", "flexbox", "layout", "generator"],
      url: "https://csslayoutgen.com/",
    },
    {
      name: "CSS Box Shadow Generator",
      categories: ["Web Development", "CSS"],
      description:
        "Build multi-layer CSS box shadows visually with live preview, inset support, per-layer opacity, presets, and copy-ready CSS output.",
      tags: ["box-shadow", "shadow", "css", "generator"],
      url: "https://boxshadowgen.com/",
    },
  ];

  /** Section display order. */
  const SECTION_ORDER = ["Web Development", "Fitness", "Business"];

  /**
   * Returns sub-categories derived from tool data (categories that are
   * not top-level section names), sorted alphabetically.
   * @return {!Array<string>}
   */
  function getSubcategories() {
    const all = TOOLS.flatMap((tool) => tool.categories);
    return [...new Set(all)]
      .filter((cat) => !SECTION_ORDER.includes(cat))
      .sort();
  }

  /**
   * Creates and renders filter chips: All, sections, then sub-categories.
   * @param {!HTMLElement} container Parent element for chips.
   */
  function renderCategoryChips(container) {
    const categories = ["All", ...SECTION_ORDER, ...getSubcategories()];

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
   * Returns tools for a section that match the active filter and query,
   * sorted alphabetically by name.
   * @param {string} section Section name (e.g. "Web Development").
   * @param {string} activeCategory Active category filter or "All".
   * @param {string} query Lowercase search string.
   * @return {!Array<!Object>} Matching tools sorted by name.
   */
  function getSectionTools(section, activeCategory, query) {
    const isAll = activeCategory === "All";
    const isSectionFilter = SECTION_ORDER.includes(activeCategory);
    const isSubcategoryFilter = !isAll && !isSectionFilter;

    // When a top-level section chip is active, skip non-matching sections
    if (isSectionFilter && activeCategory !== section) {
      return [];
    }

    return TOOLS.filter((tool) => tool.categories.includes(section))
      .filter((tool) => {
        // Sub-category chip: only tools that carry that sub-category
        if (isSubcategoryFilter) {
          return tool.categories.includes(activeCategory);
        }
        return true;
      })
      .filter((tool) => {
        if (!query) {
          return true;
        }
        const searchBlob = [
          tool.name,
          tool.categories.join(" "),
          tool.description,
          tool.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return searchBlob.includes(query);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
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
        <p class="tool-card__description">${tool.description}</p>
        <div class="tool-card__tags" aria-label="Keywords">${tagMarkup}</div>
        <a class="tool-card__cta" href="${tool.url}" target="_blank"
          rel="noopener">
          Open tool
        </a>
      </article>
    `;
  }

  /**
   * Renders tools grouped by section and updates count.
   * @param {!HTMLElement} container Sections container.
   * @param {!HTMLElement} countEl Result count element.
   * @param {!HTMLElement} emptyEl Empty-state element.
   * @param {string} category Active category filter.
   * @param {string} query Current search query.
   */
  function renderTools(container, countEl, emptyEl, category, query) {
    let totalShown = 0;

    const sectionsMarkup = SECTION_ORDER.map((section) => {
      const tools = getSectionTools(section, category, query);
      if (tools.length === 0) {
        return "";
      }
      totalShown += tools.length;
      const cardsMarkup = tools.map(getToolCardMarkup).join("");
      return `
        <div class="tool-section">
          <h3 class="tool-section__heading">${section}</h3>
          <div class="directory__grid">${cardsMarkup}</div>
        </div>
      `;
    }).join("");

    container.innerHTML = sectionsMarkup;
    const plural = totalShown === 1 ? "tool" : "tools";
    countEl.textContent = `${totalShown} ${plural} shown`;
    emptyEl.hidden = totalShown > 0;
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
