document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".nav-link");
    const currentUrl = window.location.pathname;

    links.forEach(link => {
        if (link.getAttribute("href") === currentUrl) {
            link.classList.add("text-yellow-300"); // Adds a highlight effect
        }
    });
});
