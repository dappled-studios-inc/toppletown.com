/**
 * Topple Town - Main JavaScript
 * Handles navigation, carousel, lightbox, and form functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initParallax();
    initCarousel();
    initLightbox();
    initSmoothScroll();
    initContactForm();
});

/**
 * Mobile Navigation Toggle
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!navToggle || !navLinks) return;
    
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

/**
 * Parallax Effect for Hero Section
 * Responds to mouse movement and scroll
 */
function initParallax() {
    const hero = document.querySelector('.hero');
    const parallaxContainer = document.querySelector('.parallax-container');
    const layers = document.querySelectorAll('.parallax-layer');
    
    if (!hero || !parallaxContainer || layers.length === 0) return;
    
    // Check if device supports hover (not touch-only)
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    
    // Mouse movement parallax
    if (supportsHover) {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let animationFrame = null;
        
        hero.addEventListener('mousemove', function(e) {
            const rect = hero.getBoundingClientRect();
            // Calculate mouse position relative to center (-1 to 1)
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        });
        
        hero.addEventListener('mouseleave', function() {
            // Smoothly return to center when mouse leaves
            mouseX = 0;
            mouseY = 0;
        });
        
        // Smooth animation loop for mouse parallax
        function animateMouseParallax() {
            // Lerp towards target position for smooth movement
            currentX += (mouseX - currentX) * 0.08;
            currentY += (mouseY - currentY) * 0.08;
            
            layers.forEach(layer => {
                const depth = parseFloat(layer.dataset.depth) || 0;
                const moveX = currentX * depth * 50; // Max 50px movement at depth 1
                const moveY = currentY * depth * 30; // Max 30px movement at depth 1
                
                // Combine with scroll parallax if present
                const scrollY = parseFloat(layer.dataset.scrollY) || 0;
                layer.style.transform = `translate3d(${moveX}px, ${moveY + scrollY}px, 0)`;
            });
            
            animationFrame = requestAnimationFrame(animateMouseParallax);
        }
        
        animateMouseParallax();
    }
    
    // Scroll parallax
    let ticking = false;
    
    function updateScrollParallax() {
        const scrollY = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        // Only apply parallax when hero is in view
        if (scrollY < heroHeight * 1.5) {
            layers.forEach(layer => {
                const depth = parseFloat(layer.dataset.depth) || 0;
                // Layers move up at different speeds as you scroll down
                const moveY = scrollY * depth * 0.5;
                layer.dataset.scrollY = moveY;
                
                // If mouse parallax isn't active, apply scroll directly
                if (!supportsHover) {
                    layer.style.transform = `translate3d(0, ${moveY}px, 0)`;
                }
            });
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollParallax);
            ticking = true;
        }
    });
    
    // Initial call
    updateScrollParallax();
}

/**
 * Screenshots Carousel
 */
function initCarousel() {
    const track = document.querySelector('.screenshots-track');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');
    const items = document.querySelectorAll('.screenshot-item');
    
    if (!track || items.length === 0) return;
    
    let currentIndex = 0;
    const itemsToShow = getItemsToShow();
    const totalSlides = Math.ceil(items.length / itemsToShow);
    
    // Create dots
    for (let i = 0; i < items.length; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => scrollToItem(i));
        dotsContainer.appendChild(dot);
    }
    
    // Button click handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = Math.max(0, currentIndex - 1);
            scrollToItem(currentIndex);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = Math.min(items.length - 1, currentIndex + 1);
            scrollToItem(currentIndex);
        });
    }
    
    // Scroll to specific item
    function scrollToItem(index) {
        const item = items[index];
        if (!item) return;
        
        item.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
        
        updateDots(index);
    }
    
    // Update dots on scroll
    track.addEventListener('scroll', debounce(function() {
        const scrollLeft = track.scrollLeft;
        const itemWidth = items[0].offsetWidth + 24; // width + gap
        const newIndex = Math.round(scrollLeft / itemWidth);
        updateDots(newIndex);
    }, 100));
    
    function updateDots(index) {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function getItemsToShow() {
        if (window.innerWidth >= 1024) return 4;
        if (window.innerWidth >= 768) return 3;
        return 2;
    }
}

/**
 * Screenshot Lightbox
 */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const screenshots = document.querySelectorAll('.screenshot-item img');
    
    if (!lightbox || screenshots.length === 0) return;
    
    let currentImageIndex = 0;
    const images = Array.from(screenshots).map(img => img.src);
    
    // Open lightbox on screenshot click
    screenshots.forEach((img, index) => {
        img.addEventListener('click', function() {
            currentImageIndex = index;
            openLightbox(img.src);
        });
    });
    
    // Close lightbox
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Navigation
    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        lightboxImage.src = images[currentImageIndex];
    });
    
    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % images.length;
        lightboxImage.src = images[currentImageIndex];
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            prevBtn.click();
        } else if (e.key === 'ArrowRight') {
            nextBtn.click();
        }
    });
    
    function openLightbox(src) {
        lightboxImage.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Smooth Scroll for Navigation Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            e.preventDefault();
            
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Contact Form Handling
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                status.textContent = 'Thank you! Your message has been sent.';
                status.className = 'form-status success';
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            status.textContent = 'Oops! There was an error. Please try again.';
            status.className = 'form-status error';
        }
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Hide status after 5 seconds
        setTimeout(() => {
            status.className = 'form-status';
        }, 5000);
    });
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Scroll-triggered animations (optional enhancement)
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.feature-card, .section-title').forEach(el => {
        observer.observe(el);
    });
}
