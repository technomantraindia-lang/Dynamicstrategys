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

  // 2. Video Play / Pause & Slow Playback Speed Control
  const bgVideo = document.getElementById('bgVideo');
  const btnVideoToggle = document.getElementById('btnVideoToggle');
  const iconPause = btnVideoToggle?.querySelector('.icon-pause');
  const iconPlay = btnVideoToggle?.querySelector('.icon-play');
  const textVideo = btnVideoToggle?.querySelector('.video-btn-text');

  if (bgVideo) {
    // Slow down playback to 0.7 for cinematic, smooth ambient background
    const setSlowPlaybackSpeed = () => {
      bgVideo.playbackRate = 0.7;
    };

    setSlowPlaybackSpeed();
    bgVideo.addEventListener('loadedmetadata', setSlowPlaybackSpeed);
    bgVideo.addEventListener('play', setSlowPlaybackSpeed);
    bgVideo.addEventListener('canplay', setSlowPlaybackSpeed);

    if (btnVideoToggle) {
      btnVideoToggle.addEventListener('click', () => {
        if (bgVideo.paused) {
          bgVideo.play();
          setSlowPlaybackSpeed();
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

  // Interactive services showcase: hover/focus a service name to swap the copy and image.
  const serviceShowcase = document.querySelector('[data-services-showcase]');
  if (serviceShowcase) {
    const serviceImage = serviceShowcase.querySelector('.services-showcase-image');
    const serviceTitle = serviceShowcase.querySelector('[data-service-showcase-title]');
    const serviceDescription = serviceShowcase.querySelector('[data-service-showcase-description]');
    const serviceLink = serviceShowcase.querySelector('[data-service-showcase-link]');
    const serviceOptions = Array.from(serviceShowcase.querySelectorAll('[data-service-key]'));
    const serviceData = {
      mechanical: {
        title: 'Mechanical Engineering',
        description: 'Process design, equipment selection and detailed engineering solutions for industrial projects.',
        image: 'assets/services-generated/mechanical-engineering.png',
        link: 'pages/service-detail.html?service=mechanical-engineering'
      },
      project: {
        title: 'Project Management',
        description: 'End-to-end project planning, coordination and execution support for successful delivery.',
        image: 'assets/services-generated/project-management.png',
        link: 'pages/service-detail.html?service=project-management'
      },
      electrical: {
        title: 'Electrical Engineering',
        description: 'Power distribution, electrical systems and infrastructure design.',
        image: 'assets/services-generated/electrical-engineering.png',
        link: 'pages/service-detail.html?service=electrical-engineering'
      },
      instrumentation: {
        title: 'Instrumentation & Control',
        description: 'Process automation, control systems and instrumentation engineering.',
        image: 'assets/services-generated/instrumentation-control.png',
        link: 'pages/service-detail.html?service=instrumentation-engineering'
      },
      procurement: {
        title: 'Procurement Support',
        description: 'Strategic sourcing, vendor management and cost optimization.',
        image: 'assets/services-generated/procurement-support.png',
        link: 'pages/service-detail.html?service=procurement-support'
      },
      dpr: {
        title: 'Detailed Project Reports (DPR)',
        description: 'Feasibility studies, technical and financial analysis, cost estimation and complete DPR for new projects.',
        image: 'assets/services-generated/project-management.png',
        link: 'pages/service-detail.html?service=detailed-project-reports'
      },
      labour: {
        title: 'Labour Planning & Sourcing',
        description: 'Manpower planning, skilled and unskilled labour sourcing, attendance and payroll management.',
        image: 'assets/about-engineers-hd.jpg',
        link: 'pages/service-detail.html?service=labour-planning'
      },
      logistics: {
        title: 'Logistics Planning',
        description: 'Route optimization, truck load planning, freight forwarding and material handling.',
        image: 'assets/service-consultancy.jpg',
        link: 'pages/service-detail.html?service=logistics-planning'
      },
      manufacturing: {
        title: 'Manufacturing Consultancy',
        description: 'Optimized plant layout and process flow, production planning, quality improvement and cost optimization.',
        image: 'assets/services-generated/industrial-consultancy.png',
        link: 'pages/service-detail.html?service=manufacturing-consultancy'
      },
      consultancy: {
        title: 'Industrial Consultancy',
        description: 'Feasibility studies, process optimization and operational improvement.',
        image: 'assets/services-generated/industrial-consultancy.png',
        link: 'pages/services.html'
      }
    };

    let serviceSwapTimer;
    const activateService = (key) => {
      const service = serviceData[key];
      if (!service) return;

      serviceOptions.forEach((option) => option.classList.toggle('is-active', option.dataset.serviceKey === key));
      serviceImage?.classList.add('is-changing');
      window.clearTimeout(serviceSwapTimer);
      serviceSwapTimer = window.setTimeout(() => {
        if (serviceImage) {
          serviceImage.src = service.image;
          serviceImage.alt = `${service.title} industrial project`; 
          serviceImage.classList.remove('is-changing');
        }
        if (serviceTitle) serviceTitle.textContent = service.title;
        if (serviceDescription) serviceDescription.textContent = service.description;
        if (serviceLink) serviceLink.href = service.link;
      }, 140);
    };

    serviceOptions.forEach((option) => {
      option.addEventListener('mouseenter', () => activateService(option.dataset.serviceKey));
      option.addEventListener('focus', () => activateService(option.dataset.serviceKey));
      option.addEventListener('click', () => activateService(option.dataset.serviceKey));
    });
  }

  // Interactive industries showcase on the About page.
  const industryShowcase = document.querySelector('[data-industries-showcase]');
  if (industryShowcase) {
    const industryImage = industryShowcase.querySelector('.ab-industries-showcase-image');
    const industryTitle = industryShowcase.querySelector('[data-industry-showcase-title]');
    const industryDescription = industryShowcase.querySelector('[data-industry-showcase-description]');
    const industrySubtag = industryShowcase.querySelector('[data-industry-showcase-subtag]');
    const industryCount = industryShowcase.querySelector('[data-industry-showcase-count]');
    const industryChips = industryShowcase.querySelector('[data-industry-showcase-chips]');
    const navContainer = industryShowcase.querySelector('.ab-industries-showcase-nav');
    const industryOptions = Array.from(industryShowcase.querySelectorAll('[data-industry-key]'));

    const industryData = {
      pharma: {
        title: 'Pharmaceuticals, API & Chemicals',
        subtag: 'Pharma & Biotech',
        count: '01 / 15',
        description: 'Regulated facilities, cleanrooms and engineering support for pharmaceutical, bulk drug and specialty chemical manufacturing.',
        chips: ['Cleanrooms & HVAC', 'cGMP Compliance', 'API Facilities'],
        image: '../assets/industries/01-pharmaceuticals-api-chemicals.png'
      },
      food: {
        title: 'Food & Beverages',
        subtag: 'Hygienic Process',
        count: '02 / 15',
        description: 'Hygienic process design, utility systems, pasteurization plants and automated high-throughput food packaging lines.',
        chips: ['Sanitary Piping', 'CIP/SIP Utilities', 'Cold Chain Infrastructure'],
        image: '../assets/industries/02-food-beverages.png'
      },
      fmcg: {
        title: 'FMCG Manufacturing',
        subtag: 'High Velocity Lines',
        count: '03 / 15',
        description: 'High-speed production lines, automated material handling, utilities and practical plant optimization for consumer goods.',
        chips: ['Packaging Lines', 'High-Speed Automation', 'Plant Utilities'],
        image: '../assets/industries/03-fmcg-manufacturing.jpg'
      },
      textiles: {
        title: 'Yarns & Textiles',
        subtag: 'Textile & Apparel',
        count: '04 / 15',
        description: 'End-to-end engineering support for spinning, weaving, wet processing, finishing plants and effluent management.',
        chips: ['Spinning & Weaving', 'Effluent Treatment', 'Steam & Utilities'],
        image: '../assets/industries/04-yarns-textiles.jpg'
      },
      packaging: {
        title: 'Packaging & Corrugation',
        subtag: 'Rigid & Flexible Packaging',
        count: '05 / 15',
        description: 'Flexible and rigid packaging plants, high-speed corrugated board manufacturing lines and automated warehousing.',
        chips: ['Corrugators', 'Extrusion Lines', 'Printing Automation'],
        image: '../assets/industries/05-packaging-corrugation.jpg'
      },
      heavy: {
        title: 'Fabrication & Heavy Engineering',
        subtag: 'Heavy Engineering',
        count: '06 / 15',
        description: 'Structural fabrication, heavy pressure vessels, heat exchangers, skid assemblies and industrial fabrication facilities.',
        chips: ['Pressure Vessels', 'Heavy Skids', 'ASME Standards'],
        image: '../assets/industries/06-fabrication-heavy-engineering.jpg'
      },
      automotive: {
        title: 'Automobile & Auto Ancillary',
        subtag: 'Automotive & OEM',
        count: '07 / 15',
        description: 'Assembly line engineering, robotics integration, stamping plants and Tier-1 component manufacturing facilities.',
        chips: ['Assembly Lines', 'Paint Shops', 'Robotics Integration'],
        image: '../assets/industries/07-automobile-auto-ancillary.jpg'
      },
      marine: {
        title: 'Marine & Complex Structures',
        subtag: 'Offshore & Heavy Civil',
        count: '08 / 15',
        description: 'Engineering and management for offshore platforms, shipyard infrastructure, jetty structures and heavy civil marine works.',
        chips: ['Offshore Structures', 'Jetty & Berths', 'Heavy Foundations'],
        image: '../assets/industries/08-marine-complex-structures.jpg'
      },
      glass: {
        title: 'Glass & Ceramics',
        subtag: 'Kiln & High-Temp Plants',
        count: '09 / 15',
        description: 'Furnace engineering, kiln optimization, waste heat recovery systems and batch processing for float glass and ceramic plants.',
        chips: ['Furnace Engineering', 'Waste Heat Recovery', 'Batch Plants'],
        image: '../assets/industries/09-glass-ceramics.jpg'
      },
      paper: {
        title: 'Pulp & Paper Mills',
        subtag: 'Continuous Process',
        count: '10 / 15',
        description: 'Continuous pulp processing, boiler utility loops, chemical recovery and automated high-speed paper machinery.',
        chips: ['Pulp Digesters', 'Chemical Recovery', 'Paper Machines'],
        image: '../assets/industries/10-pulp-paper-mills.jpg'
      },
      logistics: {
        title: 'Logistics & Warehousing',
        subtag: 'Supply Chain & Fulfillment',
        count: '11 / 15',
        description: 'Modern automated distribution centers, racking infrastructure, cold storage engineering and multimodal freight hubs. We also support warehouse layout, material flow, inventory handling and dispatch coordination for faster, more reliable operations.',
        chips: ['AS/RS Automation', 'Cold Storage', 'Material Flow Planning', 'Dispatch Coordination'],
        image: '../assets/industries/11-logistics-warehousing.jpg'
      },
      energy: {
        title: 'Renewable Energy',
        subtag: 'Clean Energy & Storage',
        count: '12 / 15',
        description: 'Turnkey engineering and PMC for large-scale utility solar parks, wind farms, substations and battery storage systems.',
        chips: ['Solar Utility Parks', 'Grid Substations', 'BESS Storage'],
        image: '../assets/industries/12-renewable-energy.png'
      },
      polymers: {
        title: 'Polymers & Petro-Chemicals',
        subtag: 'Petrochemical & Polymers',
        count: '13 / 15',
        description: 'Polymer synthesis units, resin compounding, plastics extrusion, distillation columns and hazardous fluid utility systems.',
        chips: ['Resin Synthesis', 'Extrusion Plants', 'Distillation Systems'],
        image: '../assets/industries/13-polymers-petro-chemicals.png'
      },
      semiconductor: {
        title: 'Semiconductor & Electronics',
        subtag: 'Ultra-Clean Fabrication',
        count: '14 / 15',
        description: 'ISO Class 1 to 5 cleanrooms, high-purity chemical and gas piping systems, ultra-pure water loops and clean utilities.',
        chips: ['ISO Cleanrooms', 'Ultra-Pure Water', 'High-Purity Gases'],
        image: '../assets/industries/14-semiconductor-electronics.jpg'
      },
      oil: {
        title: 'Oil & Gas Refineries',
        subtag: 'Refinery & Midstream',
        count: '15 / 15',
        description: 'Engineering, procurement and PMC for crude distillation units, tank farm terminals, blending facilities and pipeline networks.',
        chips: ['Crude Distillation', 'Tank Terminals', 'Pipeline Networks'],
        image: '../assets/industries/15-oil-gas-refineries.png'
      }
    };

    let industrySwapTimer;
    const activateIndustry = (key, shouldScrollNav = false) => {
      const industry = industryData[key];
      if (!industry) return;

      industryOptions.forEach((option) => {
        const isMatch = option.dataset.industryKey === key;
        option.classList.toggle('is-active', isMatch);
        option.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      if (industryImage) {
        industryImage.classList.add('is-changing');
      }

      window.clearTimeout(industrySwapTimer);
      industrySwapTimer = window.setTimeout(() => {
        if (industryImage) {
          industryImage.src = industry.image;
          industryImage.alt = `${industry.title} industrial facility`;
          industryImage.classList.remove('is-changing');
        }
        if (industryTitle) industryTitle.textContent = industry.title;
        if (industryDescription) industryDescription.textContent = industry.description;
        if (industrySubtag && industry.subtag) industrySubtag.textContent = industry.subtag;
        if (industryCount && industry.count) industryCount.textContent = industry.count;

        if (industryChips && Array.isArray(industry.chips)) {
          industryChips.innerHTML = industry.chips
            .map((chip) => `<span class="showcase-chip">${chip}</span>`)
            .join('');
        }
      }, 130);

      if (shouldScrollNav && navContainer) {
        const activeOption = industryOptions.find((opt) => opt.dataset.industryKey === key);
        if (activeOption) {
          const optTop = activeOption.offsetTop - navContainer.offsetTop;
          const optBottom = optTop + activeOption.offsetHeight;
          if (optTop < navContainer.scrollTop) {
            navContainer.scrollTo({ top: Math.max(0, optTop - 12), behavior: 'smooth' });
          } else if (optBottom > navContainer.scrollTop + navContainer.clientHeight) {
            navContainer.scrollTo({ top: optBottom - navContainer.clientHeight + 12, behavior: 'smooth' });
          }
        }
      }
    };

    industryOptions.forEach((option) => {
      option.addEventListener('mouseenter', () => activateIndustry(option.dataset.industryKey));
      option.addEventListener('focus', () => activateIndustry(option.dataset.industryKey, true));
      option.addEventListener('click', () => activateIndustry(option.dataset.industryKey, true));
    });

    // Industries View Switcher (Interactive Showcase vs 15-Card Grid)
    const industriesSection = document.getElementById('industries');
    const viewButtons = document.querySelectorAll('.ab-view-btn');
    if (industriesSection && viewButtons.length) {
      viewButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetView = btn.dataset.viewTarget;
          viewButtons.forEach((b) => {
            const isActive = b === btn;
            b.classList.toggle('is-active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });

          if (targetView === 'grid') {
            industriesSection.classList.add('show-grid-view');
          } else {
            industriesSection.classList.remove('show-grid-view');
          }
        });
      });
    }
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

    const clientLogoPrev = document.querySelector('.client-logo-arrow-prev');
    const clientLogoNext = document.querySelector('.client-logo-arrow-next');
    let manualClientPauseUntil = 0;
    const moveClientLogos = (direction) => {
      const firstCard = clientLogoRail.querySelector('.client-logo-card');
      if (!firstCard) return;
      const gap = parseFloat(window.getComputedStyle(clientLogoRail).gap) || 0;
      const step = firstCard.getBoundingClientRect().width + gap;
      const loopWidth = clientLogoRail.scrollWidth / 2;
      let nextPosition = clientLogoRail.scrollLeft + direction * step;

      if (loopWidth > 0 && nextPosition < 0) nextPosition += loopWidth;
      if (loopWidth > 0 && nextPosition >= loopWidth) nextPosition -= loopWidth;

      clientLogoRail.scrollTo({ left: nextPosition, behavior: 'smooth' });
      manualClientPauseUntil = performance.now() + 2400;
    };

    clientLogoPrev?.addEventListener('click', () => moveClientLogos(-1));
    clientLogoNext?.addEventListener('click', () => moveClientLogos(1));

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

      if (!isDragging && !document.hidden && performance.now() >= manualClientPauseUntil) {
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

  // ==========================================================================
  // ENQUIRE NOW POPUP MODAL CONTROLLER
  // ==========================================================================
  const enquiryModal = document.getElementById('enquiryModal');
  const openEnquiryBtns = document.querySelectorAll('.header-btn-touch, .mobile-btn-touch, .open-enquiry-modal, a[href="#enquiryModal"]');

  const openEnquiry = (e) => {
    if (e) e.preventDefault();
    if (!enquiryModal) return;
    enquiryModal.classList.add('is-active');
    enquiryModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = enquiryModal.querySelector('#eqFullName');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  };

  const closeEnquiry = () => {
    if (!enquiryModal) return;
    enquiryModal.classList.remove('is-active');
    enquiryModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openEnquiryBtns.forEach((btn) => {
    btn.addEventListener('click', openEnquiry);
  });

  if (enquiryModal) {
    enquiryModal.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', closeEnquiry);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && enquiryModal.classList.contains('is-active')) {
        closeEnquiry();
      }
    });

    const enquiryForm = document.getElementById('enquiryModalForm');
    if (enquiryForm) {
      enquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = enquiryForm.querySelector('.btn-enquiry-submit');
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<span>Submitting...</span>';
        btn.disabled = true;

        setTimeout(() => {
          btn.innerHTML = '<span>✓ Enquiry Sent Successfully!</span>';
          btn.style.background = '#10b981';
          setTimeout(() => {
            closeEnquiry();
            enquiryForm.reset();
            btn.innerHTML = originalContent;
            btn.style.background = '';
            btn.disabled = false;
            alert('Thank you! Your enquiry has been received. Our team will get back to you shortly.');
          }, 1200);
        }, 800);
      });
    }
  }
});

