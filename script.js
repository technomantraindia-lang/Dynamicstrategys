// ==========================================================================
// Interactive functionality for Navigation, Mobile Menu, and Video Banner
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const toggleBtn = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      navMenu.classList.toggle('is-active');
    });

    // Close menu when clicking any nav link
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggleBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-active');
      });
    });
  }

  // 2. Video Play / Pause Control
  const bgVideo = document.getElementById('bgVideo');
  const btnVideoToggle = document.getElementById('btnVideoToggle');
  const iconPause = btnVideoToggle?.querySelector('.icon-pause');
  const iconPlay = btnVideoToggle?.querySelector('.icon-play');
  const textVideo = btnVideoToggle?.querySelector('.video-btn-text');

  if (bgVideo && btnVideoToggle) {
    btnVideoToggle.addEventListener('click', () => {
      if (bgVideo.paused) {
        bgVideo.play();
        if (iconPause) iconPause.style.display = 'block';
        if (iconPlay) iconPlay.style.display = 'none';
        if (textVideo) textVideo.textContent = 'Pause Video';
      } else {
        bgVideo.pause();
        if (iconPause) iconPause.style.display = 'none';
        if (iconPlay) iconPlay.style.display = 'block';
        if (textVideo) textVideo.textContent = 'Play Video';
      }
    });
  }

  // 3. Auto Dynamic Year in Footer
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = '2025';
  }

  // 4. Smooth Animated Count-Up for Key Performance Stats
  const statBoxes = document.querySelectorAll('.stat-box[data-count]');
  const statsSection = document.getElementById('stats');

  if (statBoxes.length > 0 && statsSection && 'IntersectionObserver' in window) {
    let hasAnimated = false;
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          statBoxes.forEach((box) => {
            const numEl = box.querySelector('.stat-num');
            const target = parseInt(box.getAttribute('data-count'), 10);
            if (!numEl || isNaN(target)) return;

            const duration = 1600;
            const startTime = performance.now();

            function animateCount(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const currentVal = Math.floor(easeProgress * target);

              numEl.textContent = currentVal.toLocaleString('en-US');

              if (progress < 1) {
                requestAnimationFrame(animateCount);
              } else {
                numEl.textContent = target.toLocaleString('en-US');
              }
            }

            requestAnimationFrame(animateCount);
          });
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });

    statsObserver.observe(statsSection);
  }

  // 4b. Directional entrance animation for service and industry cards
  const revealCards = Array.from(document.querySelectorAll('.service-card, .industry-card'));
  const revealSections = Array.from(document.querySelectorAll('.core-services-section, .industries-section'));
  if (revealCards.length) {
    revealCards.forEach((card) => card.classList.add('reveal-card'));

    if (revealSections.length && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll('.reveal-card').forEach((card) => card.classList.add('is-visible'));
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.16 });

      revealSections.forEach((section) => revealObserver.observe(section));
    } else {
      revealCards.forEach((card) => card.classList.add('is-visible'));
    }
  }

  // 5. Client testimonial carousel controls
  const testimonialCards = Array.from(document.querySelectorAll('.testimonial-card'));
  const testimonialDots = Array.from(document.querySelectorAll('.testimonial-dots button'));
  const testimonialPrev = document.querySelector('.testimonial-arrow-prev');
  const testimonialNext = document.querySelector('.testimonial-arrow-next');
  const testimonialTrack = document.querySelector('.testimonials-track');
  let testimonialIndex = 0;
  let testimonialAutoplay;
  let testimonialReset;

  if (testimonialCards.length && testimonialTrack && (testimonialPrev || testimonialNext)) {
    // Add a few cloned cards so the desktop track can loop continuously.
    const testimonialClones = testimonialCards.slice(0, 3).map((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('testimonial-card-clone');
      testimonialTrack.appendChild(clone);
      return clone;
    });

    const getStep = () => {
      const firstCard = testimonialTrack.querySelector('.testimonial-card');
      const gap = parseFloat(window.getComputedStyle(testimonialTrack).gap) || 0;
      return firstCard ? firstCard.getBoundingClientRect().width + gap : 0;
    };

    const renderTestimonials = (animate = false) => {
      const isMobile = window.innerWidth <= 680;
      testimonialCards.forEach((card, index) => {
        card.style.display = isMobile ? (index === testimonialIndex ? 'block' : 'none') : '';
      });
      testimonialClones.forEach((card) => {
        card.style.display = isMobile ? 'none' : '';
      });

      if (isMobile) {
        testimonialTrack.style.transition = 'none';
        testimonialTrack.style.transform = '';
      } else {
        testimonialTrack.style.transition = animate ? 'transform 650ms cubic-bezier(.22,.61,.36,1)' : 'none';
        testimonialTrack.style.transform = `translate3d(-${testimonialIndex * getStep()}px, 0, 0)`;
      }

      testimonialDots.forEach((dot, index) => dot.classList.toggle('is-active', index === testimonialIndex % testimonialCards.length));
    };

    const goToTestimonial = (nextIndex, animate = true) => {
      window.clearTimeout(testimonialReset);
      testimonialIndex = nextIndex;
      renderTestimonials(animate);

      // After the last original card, reset invisibly to the first card.
      if (testimonialIndex === testimonialCards.length) {
        testimonialReset = window.setTimeout(() => {
          testimonialIndex = 0;
          renderTestimonials(false);
        }, 680);
      }
    };

    const moveTestimonials = (direction) => {
      const isMobile = window.innerWidth <= 680;
      if (isMobile) {
        goToTestimonial((testimonialIndex + direction + testimonialCards.length) % testimonialCards.length, false);
        return;
      }

      if (direction < 0 && testimonialIndex === 0) {
        // Start from the cloned ending cards, then animate one card backward.
        goToTestimonial(testimonialCards.length, false);
        window.requestAnimationFrame(() => goToTestimonial(testimonialCards.length - 1));
        return;
      }

      const nextIndex = testimonialIndex + direction;
      goToTestimonial(nextIndex > testimonialCards.length ? 0 : nextIndex);
    };

    const restartTestimonialAutoplay = () => {
      window.clearInterval(testimonialAutoplay);
      if (window.innerWidth > 680) {
        testimonialAutoplay = window.setInterval(() => moveTestimonials(1), 3600);
      }
    };

    testimonialPrev?.addEventListener('click', () => {
      moveTestimonials(-1);
      restartTestimonialAutoplay();
    });

    testimonialNext?.addEventListener('click', () => {
      moveTestimonials(1);
      restartTestimonialAutoplay();
    });

    testimonialDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToTestimonial(index, true);
        restartTestimonialAutoplay();
      });
    });

    testimonialTrack.addEventListener('mouseenter', () => window.clearInterval(testimonialAutoplay));
    testimonialTrack.addEventListener('mouseleave', restartTestimonialAutoplay);
    window.addEventListener('resize', () => {
      renderTestimonials(false);
      restartTestimonialAutoplay();
    });
    renderTestimonials(false);
    restartTestimonialAutoplay();
  }

  // 6. FAQ accordion controls
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-question');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('is-open');
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove('is-open');
        otherItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      if (shouldOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Keep the page flow: Working Process -> Testimonials -> FAQ
  const workingProcessSection = document.getElementById('working-process');
  const whyChooseSection = document.getElementById('why-choose');
  const testimonialsSection = document.getElementById('testimonials');
  const faqSection = document.getElementById('faq');
  if (workingProcessSection && whyChooseSection) {
    workingProcessSection.before(whyChooseSection);
  }

  if (workingProcessSection && testimonialsSection && faqSection) {
    workingProcessSection.after(testimonialsSection, faqSection);
  }
});
