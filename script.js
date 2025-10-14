document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const slideCounter = document.querySelector('.slide-counter');
    const progressBar = document.querySelector('.progress-bar');
    // const fullscreenHint = document.querySelector('.fullscreen-hint');
    const tocOverlay = document.querySelector('.toc-overlay');
    const tocList = document.getElementById('toc-list');
    const gridOverlay = document.querySelector('.grid-overlay');
    const gridContainer = document.getElementById('grid-container');

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
        const isLastSlide = currentSlide === totalSlides - 1;

        let hasNextFragment = false;
        if (slide.dataset.slideType === 'code-explanation') {
            const currentFragmentIndex = fragments.findIndex(f => f.classList.contains('visible'));
            const nextFragmentIndex = currentFragmentIndex + 1;
            hasNextFragment = nextFragmentIndex < fragments.length;
        } else {
            const visibleFragments = fragments.filter(f => f.classList.contains('visible'));
            hasNextFragment = visibleFragments.length < fragments.length;
        }

        // If we are on the last slide and there are no more fragments, do nothing.
        if (isLastSlide && !hasNextFragment) {
            return;
        }

        if (slide.dataset.slideType === 'code-explanation') {
            const currentFragmentIndex = fragments.findIndex(f => f.classList.contains('visible'));
            const nextFragmentIndex = currentFragmentIndex + 1;

            // If there are more fragments to show on this slide
            if (nextFragmentIndex < fragments.length) {
                // Hide current fragment and its highlight
                if (currentFragmentIndex > -1) {
                    fragments[currentFragmentIndex].classList.remove('visible');
                    const currentHighlightId = fragments[currentFragmentIndex].dataset.explains;
                    if (currentHighlightId) {
                        const currentHighlightEl = slide.querySelector(`[data-highlight-id="${currentHighlightId}"]`);
                        if (currentHighlightEl) currentHighlightEl.classList.remove('highlight-active');
                    }
                }
                
                // Show next fragment and its highlight
                const nextFragment = fragments[nextFragmentIndex];
                nextFragment.classList.add('visible');
                const nextHighlightId = nextFragment.dataset.explains;
                if (nextHighlightId) {
                    const nextHighlightEl = slide.querySelector(`[data-highlight-id="${nextHighlightId}"]`);
                    if (nextHighlightEl) nextHighlightEl.classList.add('highlight-active');
                }
            } else {
                // No more fragments, go to next slide
                resetSlideFragments(slide);
                currentSlide++;
                updateSlide();
            }
        } else {
            // Standard fragment logic
            const visibleFragments = fragments.filter(f => f.classList.contains('visible'));
            const nextFragment = fragments[visibleFragments.length];

            if (nextFragment) {
                nextFragment.classList.add('visible');
            } else {
                resetSlideFragments(slide);
                currentSlide++;
                updateSlide();
            }
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
            } else {
                // For code-explanation, show the last fragment
                const fragments = Array.from(prevSlideEl.querySelectorAll('.fragment'));
                if (fragments.length > 0) {
                    const lastFragment = fragments[fragments.length - 1];
                    lastFragment.classList.add('visible');
                    const highlightId = lastFragment.dataset.explains;
                    if (highlightId) {
                        const highlightEl = prevSlideEl.querySelector(`[data-highlight-id="${highlightId}"]`);
                        if (highlightEl) {
                            highlightEl.classList.add('highlight-active');
                        }
                    }
                }
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

        if (gridOverlay.classList.contains('visible')) {
            if (e.key === 'Escape') {
                toggleGrid();
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
        } else if (e.key.toLowerCase() === 'g') {
            toggleGrid();
        }
    });

    // Click/Tap navigation
    /*
    document.addEventListener('click', (e) => {
        // Don't navigate if clicking on interactive elements
        if (e.target.closest('a, button, .toc-overlay, .fullscreen-hint')) return;
        nextSlide();
    });
    */

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
    /*
    fullscreenHint.addEventListener('click', (e) => {
        e.stopPropagation();
        fullscreenHint.style.display = 'none';
    });
    */
    
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

    // Grid View
    function buildAndPositionGrid() {
        gridContainer.innerHTML = ''; // Clear existing grid

        // 1. Calculate grid dimensions to be as square as possible
        const cols = Math.ceil(Math.sqrt(totalSlides));
        const rows = Math.ceil(totalSlides / cols);

        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        // 2. Create and append all thumbnails
        const slideClones = [];
        slides.forEach((slide, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.classList.add('grid-thumbnail');
            
            const clone = slide.cloneNode(true);
            clone.classList.add('slide-clone');
            clone.classList.remove('active');
            
            clone.querySelectorAll('.fragment').forEach(f => f.classList.add('visible'));
            
            if (clone.dataset.slideType === 'code-explanation') {
                clone.querySelectorAll('[data-highlight-id]').forEach(h => h.classList.remove('highlight-active'));
                const fragments = clone.querySelectorAll('.fragment');
                if (fragments.length > 0) {
                    const lastFragment = fragments[fragments.length - 1];
                    const highlightId = lastFragment.dataset.explains;
                    if (highlightId) {
                        const highlightEl = clone.querySelector(`[data-highlight-id="${highlightId}"]`);
                        if (highlightEl) highlightEl.classList.add('highlight-active');
                    }
                }
            }

            thumbnail.appendChild(clone);
            slideClones.push(clone);

            const slideNumber = document.createElement('div');
            slideNumber.classList.add('slide-number');
            slideNumber.textContent = index + 1;
            thumbnail.appendChild(slideNumber);

            thumbnail.addEventListener('click', () => {
                toggleGrid(); // Hide grid first
                goToSlide(index);
            });

            gridContainer.appendChild(thumbnail);
        });

        // 3. Calculate scale factor and apply it
        // This needs to be done after the grid is rendered in the DOM to have a width.
        const firstThumbnail = gridContainer.querySelector('.grid-thumbnail');
        if (!firstThumbnail) return;

        const thumbWidth = firstThumbnail.offsetWidth;
        const slideBaseWidth = 1280; // Assuming a common slide width like 1280px
        const scale = thumbWidth / slideBaseWidth;
        const inverseScale = 1 / scale;

        slideClones.forEach(clone => {
            clone.style.width = `${inverseScale * 100}%`;
            clone.style.height = `${inverseScale * 100}%`;
            clone.style.transform = `scale(${scale})`;
        });
    }

    function toggleGrid() {
        const isVisible = gridOverlay.classList.toggle('visible');
        if (isVisible) {
            buildAndPositionGrid();
        }
    }

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
        // buildGrid(); // Grid is now built on-demand
        Prism.highlightAll();
    }

    initialize();
});
