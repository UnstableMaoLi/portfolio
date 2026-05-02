"use strict";

/*
  Лабораторна робота №3
  Тема: використання JavaScript для клієнтських сценаріїв.

  Реалізовано:
  - підключення окремого script.js через defer;
  - DOMContentLoaded як точка запуску;
  - обробники click, input, change, submit, scroll, keydown;
  - динамічний рендер проєктів із масиву об'єктів;
  - пошук, фільтрація, сортування;
  - керування станом інтерфейсу та localStorage;
  - модальне вікно, live preview форми, тема, кнопка повернення вгору.
*/

const STORAGE_KEY = "tamara-portfolio-lab3-state";
const CONTACT_DRAFT_KEY = "tamara-contact-draft";

const projects = [
  {
    id: "portfolio",
    title: "Portfolio landing page",
    year: 2026,
    category: "HTML",
    level: "Basic",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=700&q=80",
    shortText: "A two-page portfolio website with semantic structure and responsive CSS.",
    details: "This project shows a personal landing page, contact page, navigation, cards, lists, links and images. In the third lab it also receives dynamic JavaScript logic.",
    tags: ["HTML", "CSS", "Portfolio"]
  },
  {
    id: "creative-blog",
    title: "Creative writing blog concept",
    year: 2026,
    category: "Writing",
    level: "Idea",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",
    shortText: "A future blog for stories, notes and character ideas.",
    details: "The idea is connected with creative writing, storytelling and collecting text fragments in a clear web interface.",
    tags: ["Writing", "Content", "Future"]
  },
  {
    id: "task-helper",
    title: "Study task helper",
    year: 2025,
    category: "JavaScript",
    level: "Practice",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=700&q=80",
    shortText: "A small interface for filtering study tasks and showing details.",
    details: "This card demonstrates how arrays, objects, filter(), sort() and DOM rendering can be used for client-side interaction.",
    tags: ["JavaScript", "DOM", "Study"]
  },
  {
    id: "css-cards",
    title: "CSS cards gallery",
    year: 2025,
    category: "CSS",
    level: "Practice",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80",
    shortText: "A simple gallery layout with cards, shadows and hover effects.",
    details: "The project is focused on visual design: spacing, borders, shadows, Grid, Flexbox, hover effects and responsive adaptation.",
    tags: ["CSS", "Grid", "Design"]
  },
  {
    id: "contact-form",
    title: "Interactive contact form",
    year: 2026,
    category: "JavaScript",
    level: "Practice",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
    shortText: "A contact form with live preview, validation and localStorage draft.",
    details: "The form page updates preview while the user types, checks required fields and can save a draft to localStorage.",
    tags: ["JavaScript", "Form", "localStorage"]
  }
];

const ideas = [
  "Add a small blog page with short story fragments.",
  "Create a project card for every new university task.",
  "Use JavaScript to switch between portfolio themes.",
  "Make a gallery for screenshots, drawings or writing notes.",
  "Add a search field to every big content section."
];

const state = loadState();

document.addEventListener("DOMContentLoaded", () => {
  setVisitStatus();
  initTheme();
  initNavbarOnScroll();
  initBackToTop();
  initRandomIdeaButton();
  initRevealOnScroll();
  initProjectsPage();
  initContactForm();
  initGlobalKeys();
});

function loadState() {
  const defaults = {
    theme: "light",
    search: "",
    category: "all",
    sort: "default",
    selectedProjectId: null
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setVisitStatus() {
  const status = document.getElementById("visitStatus");
  if (!status) return;

  const now = new Date();
  const formatted = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(now);

  status.textContent = `JavaScript is active. Page opened: ${formatted}.`;
}

function initTheme() {
  const toggle = document.getElementById("themeToggle");
  applyTheme(state.theme);

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    state.theme = document.body.classList.contains("dark-theme") ? "light" : "dark";
    applyTheme(state.theme);
    saveState();
    showToast(state.theme === "dark" ? "Dark theme enabled" : "Light theme enabled");
  });
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.textContent = isDark ? "Light theme" : "Dark theme";
    toggle.setAttribute("aria-pressed", String(isDark));
  }
}

function initNavbarOnScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const updateNavbar = () => {
    navbar.classList.toggle("navbar-scrolled", window.scrollY > 30);
  };

  window.addEventListener("scroll", updateNavbar, { passive: true });
  updateNavbar();
}

function initBackToTop() {
  const button = document.getElementById("backToTop");
  if (!button) return;

  const toggleButton = () => {
    button.classList.toggle("back-to-top-visible", window.scrollY > 450);
  };

  window.addEventListener("scroll", toggleButton, { passive: true });
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  toggleButton();
}

function initRandomIdeaButton() {
  const button = document.getElementById("quoteButton");
  const status = document.getElementById("visitStatus");

  if (!button || !status) return;

  button.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * ideas.length);
    status.textContent = ideas[randomIndex];
    status.classList.add("is-highlighted");
    window.setTimeout(() => status.classList.remove("is-highlighted"), 650);
  });
}

function initRevealOnScroll() {
  const elements = document.querySelectorAll(".reveal-target");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });

  elements.forEach((element) => observer.observe(element));
}

function initProjectsPage() {
  const grid = document.getElementById("projectGrid");
  const searchInput = document.getElementById("projectSearch");
  const sortSelect = document.getElementById("projectSort");
  const resetButton = document.getElementById("resetFilters");
  const tagList = document.getElementById("tagList");

  if (!grid || !searchInput || !sortSelect || !resetButton || !tagList) return;

  searchInput.value = state.search;
  sortSelect.value = state.sort;

  renderTagButtons();
  renderProjects();

  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    saveState();
    renderProjects();
  });

  sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    saveState();
    renderProjects();
  });

  resetButton.addEventListener("click", () => {
    state.search = "";
    state.category = "all";
    state.sort = "default";
    state.selectedProjectId = null;
    searchInput.value = "";
    sortSelect.value = "default";
    saveState();
    renderTagButtons();
    renderProjects();
    renderProjectDetails(null);
    showToast("Filters reset");
  });

  tagList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;

    state.category = button.dataset.category;
    saveState();
    renderTagButtons();
    renderProjects();
  });

  grid.addEventListener("click", (event) => {
    const detailsButton = event.target.closest("button[data-project-id]");
    if (!detailsButton) return;

    const project = projects.find((item) => item.id === detailsButton.dataset.projectId);
    if (!project) return;

    state.selectedProjectId = project.id;
    saveState();
    renderProjects();
    renderProjectDetails(project);
    openModal(project);
  });

  if (state.selectedProjectId) {
    const selected = projects.find((project) => project.id === state.selectedProjectId);
    renderProjectDetails(selected || null);
  }
}

function renderTagButtons() {
  const tagList = document.getElementById("tagList");
  if (!tagList) return;

  const categories = ["all", ...new Set(projects.map((project) => project.category))];

  tagList.innerHTML = categories.map((category) => {
    const label = category === "all" ? "All" : category;
    const activeClass = state.category === category ? " tag-active" : "";
    return `<button class="tag-button${activeClass}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(label)}</button>`;
  }).join("");
}

function renderProjects() {
  const grid = document.getElementById("projectGrid");
  const resultCount = document.getElementById("resultCount");
  if (!grid || !resultCount) return;

  const visibleProjects = getVisibleProjects();
  resultCount.textContent = `${visibleProjects.length} / ${projects.length} projects`;

  if (visibleProjects.length === 0) {
    grid.innerHTML = `
      <article class="card empty-card">
        <h3>No projects found</h3>
        <p>Try changing the search text or selecting another category.</p>
      </article>
    `;
    return;
  }

  grid.innerHTML = visibleProjects.map((project) => {
    const isSelected = state.selectedProjectId === project.id;
    return `
      <article class="card project-card ${isSelected ? "is-selected" : ""}" data-card-id="${escapeHtml(project.id)}">
        <img src="${escapeAttribute(project.image)}" alt="${escapeAttribute(project.title)}" width="500" height="300">
        <div class="project-card-body">
          <div class="project-meta">
            <span>${escapeHtml(project.category)}</span>
            <span>${escapeHtml(project.level)}</span>
            <span>${project.year}</span>
          </div>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.shortText)}</p>
          <div class="project-tags">
            ${project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
          <button class="text-button" type="button" data-project-id="${escapeHtml(project.id)}">Details</button>
        </div>
      </article>
    `;
  }).join("");
}

function getVisibleProjects() {
  const search = state.search.toLowerCase();

  const filtered = projects.filter((project) => {
    const matchesCategory = state.category === "all" || project.category === state.category;
    const searchableText = `${project.title} ${project.shortText} ${project.details} ${project.tags.join(" ")}`.toLowerCase();
    const matchesSearch = !search || searchableText.includes(search);
    return matchesCategory && matchesSearch;
  });

  return filtered.sort((a, b) => {
    switch (state.sort) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "year-desc":
        return b.year - a.year;
      case "year-asc":
        return a.year - b.year;
      default:
        return projects.indexOf(a) - projects.indexOf(b);
    }
  });
}

function renderProjectDetails(project) {
  const panel = document.getElementById("projectDetails");
  if (!panel) return;

  if (!project) {
    panel.innerHTML = `
      <p class="section-label">Selected project</p>
      <h3>No project selected</h3>
      <p>Click the “Details” button on any project card to show more information here.</p>
    `;
    return;
  }

  panel.innerHTML = `
    <p class="section-label">Selected project</p>
    <h3>${escapeHtml(project.title)}</h3>
    <p>${escapeHtml(project.details)}</p>
    <ul>
      <li><strong>Category:</strong> ${escapeHtml(project.category)}</li>
      <li><strong>Level:</strong> ${escapeHtml(project.level)}</li>
      <li><strong>Year:</strong> ${project.year}</li>
    </ul>
  `;
}

function openModal(project) {
  const modal = document.getElementById("projectModal");
  const title = document.getElementById("modalTitle");
  const description = document.getElementById("modalDescription");
  const meta = document.getElementById("modalMeta");

  if (!modal || !title || !description || !meta) return;

  title.textContent = project.title;
  description.textContent = project.details;
  meta.innerHTML = `
    <li>Category: ${escapeHtml(project.category)}</li>
    <li>Level: ${escapeHtml(project.level)}</li>
    <li>Year: ${project.year}</li>
    <li>Tags: ${project.tags.map(escapeHtml).join(", ")}</li>
  `;

  modal.classList.add("modal-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  modal.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", closeModal, { once: true });
  });
}

function closeModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  modal.classList.remove("modal-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  const preview = document.getElementById("messagePreview");
  if (!form || !preview) return;

  restoreDraft(form);
  updateMessagePreview(form, preview);

  form.addEventListener("input", () => {
    updateMessagePreview(form, preview);
    saveDraftIfNeeded(form);
  });

  form.addEventListener("change", () => {
    updateMessagePreview(form, preview);
    saveDraftIfNeeded(form);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm(form)) {
      showToast("Please fill in all required fields correctly");
      return;
    }

    updateMessagePreview(form, preview, true);
    saveDraftIfNeeded(form);
    showToast("Message preview was created successfully");
  });
}

function validateForm(form) {
  let isValid = true;
  const fields = ["userName", "userEmail", "messageTopic", "messageText"];

  fields.forEach((fieldName) => {
    const field = form.elements[fieldName];
    const error = document.querySelector(`[data-error-for="${fieldName}"]`);
    let message = "";

    if (!field.value.trim()) {
      message = "This field is required.";
    } else if (fieldName === "userName" && field.value.trim().length < 2) {
      message = "Name must contain at least 2 characters.";
    } else if (fieldName === "userEmail" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
      message = "Enter a valid email address.";
    } else if (fieldName === "messageText" && field.value.trim().length < 10) {
      message = "Message must contain at least 10 characters.";
    }

    if (error) error.textContent = message;
    field.classList.toggle("input-error", Boolean(message));
    if (message) isValid = false;
  });

  return isValid;
}

function updateMessagePreview(form, preview, submitted = false) {
  const formData = new FormData(form);
  const name = formData.get("userName")?.trim() || "Your name";
  const email = formData.get("userEmail")?.trim() || "email@example.com";
  const topic = formData.get("messageTopic") || "not selected";
  const text = formData.get("messageText")?.trim() || "Your message will appear here.";

  preview.innerHTML = `
    <p class="section-label">Live preview</p>
    <h3>${submitted ? "Ready message" : "Message preview"}</h3>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
    <p>${escapeHtml(text)}</p>
  `;
}

function saveDraftIfNeeded(form) {
  const checkbox = form.elements.saveMessage;

  if (!checkbox.checked) {
    localStorage.removeItem(CONTACT_DRAFT_KEY);
    return;
  }

  const draft = {
    userName: form.elements.userName.value,
    userEmail: form.elements.userEmail.value,
    messageTopic: form.elements.messageTopic.value,
    messageText: form.elements.messageText.value,
    saveMessage: checkbox.checked
  };

  localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(draft));
}

function restoreDraft(form) {
  try {
    const draft = JSON.parse(localStorage.getItem(CONTACT_DRAFT_KEY));
    if (!draft) return;

    form.elements.userName.value = draft.userName || "";
    form.elements.userEmail.value = draft.userEmail || "";
    form.elements.messageTopic.value = draft.messageTopic || "";
    form.elements.messageText.value = draft.messageText || "";
    form.elements.saveMessage.checked = draft.saveMessage !== false;
  } catch {
    localStorage.removeItem(CONTACT_DRAFT_KEY);
  }
}

function initGlobalKeys() {
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }

    if (event.key === "/" && document.body.dataset.page === "index") {
      const search = document.getElementById("projectSearch");
      if (!search) return;
      event.preventDefault();
      search.focus();
    }
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("toast-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("toast-visible");
  }, 2200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
