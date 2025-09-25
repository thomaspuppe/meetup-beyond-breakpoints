document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const slideCounter = document.querySelector('.slide-counter');
    const progressBar = document.querySelector('.progress-bar');
    const fullscreenHint = document.querySelector('.fullscreen-hint');
    const tocOverlay = document.querySelector('.toc-overlay');
    const tocList = document.getElementById('toc-list');

    let currentSlide = 0;
    const totalSlides = slides.length;

    function updateSlide() {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        updateCounter();
        updateProgressBar();
        updateUrlHash();
    }

    function updateUrlHash() {
        const newHash = `#${currentSlide + 1}`;
        if (window.location.hash !== newHash) {
            // Use pushState to allow browser back/forward navigation between slides
            history.pushState({slide: currentSlide}, `Slide ${currentSlide + 1}`, newHash);
        }
    }

    function updateCounter() {
        slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }

    function updateProgressBar() {
        const progress = ((currentSlide + 1) / totalSlides) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function nextSlide() {
        const slide = slides[currentSlide];
        const fragments = Array.from(slide.querySelectorAll('.fragment'));
        const visibleFragments = fragments.filter(f => f.classList.contains('visible'));
        const nextFragment = fragments[visibleFragments.length];

        if (nextFragment) {
            if (slide.dataset.slideType === 'code-explanation') {
                // Hide all other fragments in this container
                fragments.forEach(f => f.classList.remove('visible'));
                // De-highlight all spans
                slide.querySelectorAll('[data-highlight-id]').forEach(h => h.classList.remove('highlight-active'));
                
                // Show the next fragment
                nextFragment.classList.add('visible');
                // Highlight the corresponding code, if it exists
                const highlightId = nextFragment.dataset.explains;
                if (highlightId) {
                    const highlightEl = slide.querySelector(`[data-highlight-id="${highlightId}"]`);
                    if (highlightEl) {
                        highlightEl.classList.add('highlight-active');
                    }
                }
            } else {
                nextFragment.classList.add('visible');
            }
        } else {
            // Reset slide before moving on
            resetSlideFragments(slide);
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlide();
        }
    }

    function prevSlide() {
        const slide = slides[currentSlide];
        const fragments = Array.from(slide.querySelectorAll('.fragment'));
        const visibleFragments = fragments.filter(f => f.classList.contains('visible'));

        if (visibleFragments.length > 0) {
            const lastVisibleFragment = visibleFragments[visibleFragments.length - 1];
            
            if (slide.dataset.slideType === 'code-explanation') {
                lastVisibleFragment.classList.remove('visible');
                const highlightId = lastVisibleFragment.dataset.explains;
                if (highlightId) {
                    const highlightEl = slide.querySelector(`[data-highlight-id="${highlightId}"]`);
                    if (highlightEl) {
                        highlightEl.classList.remove('highlight-active');
                    }
                }

                const prevFragment = visibleFragments[visibleFragments.length - 2];
                if (prevFragment) {
                    prevFragment.classList.add('visible');
                    const prevHighlightId = prevFragment.dataset.explains;
                    if (prevHighlightId) {
                        const prevHighlightEl = slide.querySelector(`[data-highlight-id="${prevHighlightId}"]`);
                        if (prevHighlightEl) {
                            prevHighlightEl.classList.add('highlight-active');
                        }
                    }
                }
            } else {
                lastVisibleFragment.classList.remove('visible');
            }
        } else {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlide();
            // When moving back to a slide, show all fragments by default
            const prevSlideEl = slides[currentSlide];
            if (prevSlideEl.dataset.slideType !== 'code-explanation') {
                prevSlideEl.querySelectorAll('.fragment').forEach(f => f.classList.add('visible'));
            }
        }
    }
    
    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            // Reset fragments on the old slide
            if (slides[currentSlide]) {
                resetSlideFragments(slides[currentSlide]);
            }
            currentSlide = index;
            updateSlide();
        }
    }

    function resetSlideFragments(slide) {
        slide.querySelectorAll('.fragment').forEach(f => f.classList.remove('visible'));
        if (slide.dataset.slideType === 'code-explanation') {
            slide.querySelectorAll('[data-highlight-id]').forEach(h => h.classList.remove('highlight-active'));
        }
    }

    // Handle hash changes for browser navigation
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.slide !== undefined) {
            goToSlide(e.state.slide);
        } else {
            // Handle initial load or hashes without state
            const slideNum = parseInt(window.location.hash.substring(1), 10) - 1;
            if (!isNaN(slideNum)) {
                goToSlide(slideNum);
            }
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (tocOverlay.classList.contains('visible')) {
            if (e.key === 'Escape') {
                toggleTOC();
            }
            return;
        }

        if (e.key === 'ArrowRight' || e.key === ' ') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'Home') {
            goToSlide(0);
        } else if (e.key === 'End') {
            goToSlide(totalSlides - 1);
        } else if (e.key.toLowerCase() === 't') {
            toggleTOC();
        }
    });

    // Click/Tap navigation
    document.addEventListener('click', (e) => {
        // Don't navigate if clicking on interactive elements
        if (e.target.closest('a, button, .toc-overlay, .fullscreen-hint')) return;
        nextSlide();
    });

    // Swipe navigation
    let touchstartX = 0;
    let touchendX = 0;

    document.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchendX < touchstartX) {
            nextSlide();
        }
        if (touchendX > touchstartX) {
            prevSlide();
        }
    }

    // Fullscreen hint
    fullscreenHint.addEventListener('click', (e) => {
        e.stopPropagation();
        fullscreenHint.style.display = 'none';
    });
    
    // Table of Contents
    function buildTOC() {
        slides.forEach((slide, index) => {
            const title = slide.dataset.title || `Slide ${index + 1}`;
            const li = document.createElement('li');
            li.textContent = title;
            li.addEventListener('click', () => {
                goToSlide(index);
                toggleTOC();
            });
            tocList.appendChild(li);
        });
    }

    function toggleTOC() {
        tocOverlay.classList.toggle('visible');
    }
    
    tocOverlay.addEventListener('click', (e) => {
        if (e.target === tocOverlay) {
            toggleTOC();
        }
    });

    // Initial setup
    function initialize() {
        const slideNum = parseInt(window.location.hash.substring(1), 10) - 1;
        if (!isNaN(slideNum) && slideNum >= 0 && slideNum < totalSlides) {
            currentSlide = slideNum;
        }
        // Make sure fragments are reset on initial load
        slides.forEach(resetSlideFragments);
        updateSlide();
        buildTOC();
        Prism.highlightAll();
    }

    initialize();
});
