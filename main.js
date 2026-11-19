"use strict";

const root = document.documentElement;

// ---------- Theme ----------
const THEME_KEY = "theme";
const toggle = document.querySelector("[data-theme-toggle]");

function storedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function currentTheme() {
  return root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

applyTheme(storedTheme() || currentTheme());

toggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* private mode: the choice just won't be remembered */
  }
});

// ---------- Header border on scroll ----------
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Project filters ----------
const chips = [...document.querySelectorAll("[data-filter]")];
const projects = [...document.querySelectorAll("[data-projects] .project")];
const empty = document.querySelector("[data-empty]");

chips.forEach((chip) =>
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    let shown = 0;
    projects.forEach((project) => {
      const match = filter === "all" || project.dataset.tags.split(" ").includes(filter);
      project.hidden = !match;
      if (match) shown += 1;
    });
    empty.hidden = shown > 0;
  }),
);

// ---------- Reveal on scroll ----------
const revealTargets = document.querySelectorAll(".section__head, .project, .timeline, .skill-group, .certs, .contact");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

// ---------- Resume links: hide them if the PDF isn't published ----------
const resumeLinks = document.querySelectorAll("[data-resume]");
if (resumeLinks.length) {
  fetch(resumeLinks[0].getAttribute("href"), { method: "HEAD" })
    .then((response) => {
      if (!response.ok) resumeLinks.forEach((link) => link.remove());
    })
    .catch(() => {});
}

// ---------- Footer year ----------
document.querySelector("[data-year]").textContent = new Date().getFullYear();
