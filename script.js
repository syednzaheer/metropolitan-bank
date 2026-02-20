/**
 * Metropolitan Bank — script.js
 * Interactions:
 *   1. Mobile navigation toggle
 *   2. Scroll fade-in (IntersectionObserver)
 *   3. Counter animation (linear ease, no bounce)
 *   4. Testimonial fade rotation (opacity only, 5s interval)
 *   5. Smooth anchor scroll
 */

(function () {
    'use strict';

    /* ============================================================
       1. MOBILE NAVIGATION TOGGLE
       ============================================================ */
    const navToggle = document.getElementById('navToggle');
    const primaryNav = document.getElementById('primaryNav');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', function () {
            const isOpen = primaryNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close nav when a link is clicked
        primaryNav.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                primaryNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close nav on outside click
        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !primaryNav.contains(e.target)) {
                primaryNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ============================================================
       2. SCROLL FADE-IN (IntersectionObserver)
       ============================================================ */
    const fadeElements = document.querySelectorAll('.fade-in-section');

    if ('IntersectionObserver' in window && fadeElements.length > 0) {
        const fadeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        fadeElements.forEach(function (el) {
            fadeObserver.observe(el);
        });
    } else {
        // Fallback: show all immediately if IntersectionObserver not supported
        fadeElements.forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    /* ============================================================
       3. COUNTER ANIMATION
       Smooth linear increment, ~2 seconds duration, no bounce.
       ============================================================ */
    const counterElements = document.querySelectorAll('.counter-value');
    let countersStarted = false;

    /**
     * Animate a single counter element from 0 to its target value.
     * @param {HTMLElement} el — the counter element
     */
    function animateCounter(el) {
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
        const duration = 2000; // ms
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Linear easing — no bounce, no overshoot
            const current = target * progress;

            el.textContent = current.toFixed(decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toFixed(decimals) + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    /**
     * Observe the counters section; start animation when visible.
     */
    function initCounters() {
        if (counterElements.length === 0) return;

        if ('IntersectionObserver' in window) {
            const counterObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !countersStarted) {
                        countersStarted = true;
                        counterElements.forEach(animateCounter);
                        counterObserver.disconnect();
                    }
                });
            }, { threshold: 0.3 });

            const countersSection = document.getElementById('counters');
            if (countersSection) {
                counterObserver.observe(countersSection);
            }
        } else {
            // Fallback: animate immediately
            counterElements.forEach(animateCounter);
        }
    }

    initCounters();

    /* ============================================================
       4. TESTIMONIAL FADE ROTATION
       Opacity transition only. 5-second interval.
       ============================================================ */
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const dots = document.querySelectorAll('.dot');
    let currentTestimonial = 0;
    let testimonialTimer = null;

    /**
     * Show a specific testimonial by index.
     * @param {number} index
     */
    function showTestimonial(index) {
        // Deactivate current
        testimonialItems[currentTestimonial].classList.remove('active');
        testimonialItems[currentTestimonial].setAttribute('aria-hidden', 'true');
        dots[currentTestimonial].classList.remove('active');
        dots[currentTestimonial].setAttribute('aria-selected', 'false');

        // Activate new
        currentTestimonial = (index + testimonialItems.length) % testimonialItems.length;
        testimonialItems[currentTestimonial].classList.add('active');
        testimonialItems[currentTestimonial].setAttribute('aria-hidden', 'false');
        dots[currentTestimonial].classList.add('active');
        dots[currentTestimonial].setAttribute('aria-selected', 'true');
    }

    /**
     * Advance to the next testimonial.
     */
    function nextTestimonial() {
        showTestimonial(currentTestimonial + 1);
    }

    /**
     * Start the auto-rotation timer.
     */
    function startTestimonialTimer() {
        testimonialTimer = setInterval(nextTestimonial, 5000);
    }

    /**
     * Reset the auto-rotation timer (used when user clicks a dot).
     */
    function resetTestimonialTimer() {
        clearInterval(testimonialTimer);
        startTestimonialTimer();
    }

    if (testimonialItems.length > 0) {
        // Attach dot click handlers
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (i !== currentTestimonial) {
                    showTestimonial(i);
                    resetTestimonialTimer();
                }
            });
        });

        // Start auto-rotation
        startTestimonialTimer();

        // Pause on hover / focus for accessibility
        const sliderRegion = document.querySelector('.testimonials-slider');
        if (sliderRegion) {
            sliderRegion.addEventListener('mouseenter', function () {
                clearInterval(testimonialTimer);
            });
            sliderRegion.addEventListener('mouseleave', function () {
                startTestimonialTimer();
            });
            sliderRegion.addEventListener('focusin', function () {
                clearInterval(testimonialTimer);
            });
            sliderRegion.addEventListener('focusout', function () {
                startTestimonialTimer();
            });
        }
    }

    /* ============================================================
       5. SMOOTH ANCHOR SCROLL
       Handles nav links and CTA buttons that point to #sections.
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (!targetEl) return;

            e.preventDefault();

            const headerHeight = document.querySelector('.site-header')
                ? document.querySelector('.site-header').offsetHeight
                : 0;

            const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
        });
    });

})();
