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
    yearSpan.textContent = '2026';
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
  const valuedClientsSection = document.getElementById('clients');
  const faqSection = document.getElementById('faq');
  if (workingProcessSection && whyChooseSection) {
    workingProcessSection.before(whyChooseSection);
  }

  if (workingProcessSection && testimonialsSection && valuedClientsSection && faqSection) {
    workingProcessSection.after(testimonialsSection, valuedClientsSection, faqSection);
  }

  // Auto-move the client-logo rail from right to left like a marquee carousel.
  const clientLogoRail = document.querySelector('.client-logo-row');
  if (clientLogoRail) {
    const originalClientCards = Array.from(clientLogoRail.children);
    originalClientCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clientLogoRail.appendChild(clone);
    });

    let isDragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;

    clientLogoRail.addEventListener('pointerdown', (event) => {
      isDragging = true;
      dragStartX = event.clientX;
      dragScrollLeft = clientLogoRail.scrollLeft;
      clientLogoRail.classList.add('is-dragging');
      clientLogoRail.setPointerCapture?.(event.pointerId);
    });

    clientLogoRail.addEventListener('pointermove', (event) => {
      if (!isDragging) return;
      clientLogoRail.scrollLeft = dragScrollLeft - (event.clientX - dragStartX);
    });

    const stopDragging = () => {
      isDragging = false;
      clientLogoRail.classList.remove('is-dragging');
    };

    clientLogoRail.addEventListener('pointerup', stopDragging);
    clientLogoRail.addEventListener('pointercancel', stopDragging);
    clientLogoRail.addEventListener('pointerleave', stopDragging);

    let previousFrameTime = performance.now();
    const autoMove = (frameTime) => {
      const elapsed = Math.min(frameTime - previousFrameTime, 64);
      previousFrameTime = frameTime;

      if (!isDragging && !document.hidden) {
        const moveBy = 42 * (elapsed / 1000);
        clientLogoRail.scrollLeft += moveBy;
        const loopWidth = clientLogoRail.scrollWidth / 2;
        if (loopWidth > 0 && clientLogoRail.scrollLeft >= loopWidth) {
          clientLogoRail.scrollLeft -= loopWidth;
        }
      }

      window.requestAnimationFrame(autoMove);
    };

    window.requestAnimationFrame(autoMove);
  }

  // Dynamic calculation for Working Process ("From Concept to Completion") dotted connector lines
  const updateConceptConnectors = () => {
    const stage = document.getElementById('conceptStage');
    const svg = document.getElementById('conceptConnectorsSvg');
    const hub = document.getElementById('conceptHub');
    if (!stage || !svg || !hub) return;
    if (window.innerWidth < 1024) return;

    const stageRect = stage.getBoundingClientRect();
    const hubRect = hub.getBoundingClientRect();

    // Keep SVG user coordinates identical to the responsive stage pixels.
    // Without an explicit viewBox, some browsers scale the connector paths
    // differently from the cards, leaving a visible gap at the card edges.
    svg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
    svg.setAttribute('width', stageRect.width);
    svg.setAttribute('height', stageRect.height);

    // Hub center and radius in stage coordinates
    const hx = hubRect.left + hubRect.width / 2 - stageRect.left;
    const hy = hubRect.top + hubRect.height / 2 - stageRect.top;
    const hr = hubRect.width / 2 + 1; // outer ring perimeter

    // Hub connection angles (radians)
    const hubAngles = {
      card1: -142 * (Math.PI / 180),
      card2: Math.PI,
      card3: 142 * (Math.PI / 180),
      card4: -38 * (Math.PI / 180),
      card5: 0,
      card6: 38 * (Math.PI / 180)
    };

    const cards = [
      { id: 'conceptCard1', key: 'card1', isLeft: true, pathId: 'conceptPath1', cardDotId: 'conceptCardDot1', hubDotId: 'conceptHubDot1', midDotId: 'conceptMidDot1' },
      { id: 'conceptCard2', key: 'card2', isLeft: true, pathId: 'conceptPath2', cardDotId: 'conceptCardDot2', hubDotId: 'conceptHubDot2', midDotId: 'conceptMidDot2' },
      { id: 'conceptCard3', key: 'card3', isLeft: true, pathId: 'conceptPath3', cardDotId: 'conceptCardDot3', hubDotId: 'conceptHubDot3', midDotId: 'conceptMidDot3' },
      { id: 'conceptCard4', key: 'card4', isLeft: false, pathId: 'conceptPath4', cardDotId: 'conceptCardDot4', hubDotId: 'conceptHubDot4', midDotId: 'conceptMidDot4' },
      { id: 'conceptCard5', key: 'card5', isLeft: false, pathId: 'conceptPath5', cardDotId: 'conceptCardDot5', hubDotId: 'conceptHubDot5', midDotId: 'conceptMidDot5' },
      { id: 'conceptCard6', key: 'card6', isLeft: false, pathId: 'conceptPath6', cardDotId: 'conceptCardDot6', hubDotId: 'conceptHubDot6', midDotId: 'conceptMidDot6' },
    ];

    cards.forEach(item => {
      const cardEl = document.getElementById(item.id);
      const pathEl = document.getElementById(item.pathId);
      const cardDotEl = document.getElementById(item.cardDotId);
      const hubDotEl = document.getElementById(item.hubDotId);
      const midDotEl = document.getElementById(item.midDotId);

      if (!cardEl || !pathEl || !cardDotEl || !hubDotEl) return;

      const cRect = cardEl.getBoundingClientRect();
      const cx = item.isLeft ? (cRect.right - stageRect.left) : (cRect.left - stageRect.left);
      const cy = cRect.top + cRect.height / 2 - stageRect.top;

      const angle = hubAngles[item.key];
      const hxPoint = hx + hr * Math.cos(angle);
      const hyPoint = hy + hr * Math.sin(angle);

      let d = '';
      let midX = (cx + hxPoint) / 2;
      let midY = (cy + hyPoint) / 2;

      if (item.key === 'card2' || item.key === 'card5') {
        d = `M ${cx} ${cy} L ${hxPoint} ${hyPoint}`;
        midX = (cx + hxPoint) / 2;
        midY = (cy + hyPoint) / 2;
      } else {
        const cp1x = cx + (hxPoint - cx) * 0.52;
        const cp1y = cy;
        const cp2x = hxPoint - (hxPoint - cx) * 0.15;
        const cp2y = hyPoint;
        d = `M ${cx} ${cy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${hxPoint} ${hyPoint}`;

        // Place the middle dot on the actual Bezier curve, not on a linear
        // approximation, so it stays aligned at every viewport size.
        const t = 0.5;
        const mt = 1 - t;
        midX =
          (mt ** 3 * cx) +
          (3 * mt ** 2 * t * cp1x) +
          (3 * mt * t ** 2 * cp2x) +
          (t ** 3 * hxPoint);
        midY =
          (mt ** 3 * cy) +
          (3 * mt ** 2 * t * cp1y) +
          (3 * mt * t ** 2 * cp2y) +
          (t ** 3 * hyPoint);
      }

      pathEl.setAttribute('d', d);
      cardDotEl.setAttribute('cx', cx);
      cardDotEl.setAttribute('cy', cy);
      hubDotEl.setAttribute('cx', hxPoint);
      hubDotEl.setAttribute('cy', hyPoint);

      if (midDotEl) {
        midDotEl.setAttribute('cx', midX);
        midDotEl.setAttribute('cy', midY);
      }
    });
  };

  updateConceptConnectors();
  window.addEventListener('resize', updateConceptConnectors);
  window.addEventListener('load', updateConceptConnectors);

  const conceptStage = document.getElementById('conceptStage');
  if (conceptStage && window.ResizeObserver) {
    new ResizeObserver(updateConceptConnectors).observe(conceptStage);
  }
});
