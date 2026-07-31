document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for internal links
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Interactive effect for educational card items
  const eduItems = document.querySelectorAll('.edu-item');

  eduItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.cursor = 'pointer';
    });
  });
});