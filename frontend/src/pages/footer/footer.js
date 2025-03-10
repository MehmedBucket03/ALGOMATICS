document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.footer-link').forEach(link => {
        link.addEventListener('click', function () {
            document.querySelectorAll('.footer-link').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
