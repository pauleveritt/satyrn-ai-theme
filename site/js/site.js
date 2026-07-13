const toggle = document.querySelector("[data-theme-toggle]");

function setTheme(mode) {
    document.documentElement.style.colorScheme = mode;
    if (mode === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
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
