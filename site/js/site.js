const toggle = document.querySelector("[data-theme-toggle]");

function setTheme(mode) {
    document.documentElement.style.colorScheme = mode;
    // Set an explicit data-theme in BOTH directions. Removing the
    // attribute for light mode would re-expose the
    // "@media (prefers-color-scheme: dark) :root:not([data-theme])"
    // rule, so toggling to light on a dark-mode OS would leave the
    // page dark. An explicit data-theme="light" beats that media query.
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("theme", mode);
    if (toggle) toggle.checked = mode === "dark";
}

const saved = localStorage.getItem("theme");
if (saved) {
    setTheme(saved);
} else {
    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;
    if (prefersDark) setTheme("dark");
}
if (toggle) {
    toggle.addEventListener("change", () => {
        setTheme(toggle.checked ? "dark" : "light");
    });
}
