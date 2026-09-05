// 1. Infinite Image Carousel Logic (Now with 3.5s Auto-Scroll Integrated)
document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".image-batch-images");
    const viewport = document.querySelector(".image-batch-wrap");
    const leftBtn = document.querySelector(".left-btn");
    const rightBtn = document.querySelector(".right-btn");

    if (!track || !viewport) return;

    const originalItems = Array.from(track.children);
    const itemWidth = originalItems[0].offsetWidth;
    const gap = 35;

    // Clone items multiple times on both ends to create a massive buffer
    for (let i = 0; i < 3; i++) {
        originalItems.forEach(item => {
            track.appendChild(item.cloneNode(true));
        });
        originalItems.slice().reverse().forEach(item => {
            track.insertBefore(item.cloneNode(true), track.firstChild);
        });
    }

    let currentIndex = originalItems.length * 3;
    let isMoving = false; // Prevents spam-clicking from breaking the loop
    let autoScrollTimer;  // The timer variable

    function setInitialPosition() {
        const viewportWidth = viewport.offsetWidth;
        const targetCard = track.children[currentIndex];
        if (!targetCard) return;
        const cardLeft = targetCard.offsetLeft;
        const centerOffset = cardLeft - (viewportWidth / 2) + (itemWidth / 2);
        viewport.scrollLeft = centerOffset;
    }

    function scrollToIndex(index, behavior = "smooth") {
        const viewportWidth = viewport.offsetWidth;
        const targetCard = track.children[index];
        if (!targetCard) return;

        const cardLeft = targetCard.offsetLeft;
        const centerOffset = cardLeft - (viewportWidth / 2) + (itemWidth / 2);

        viewport.scrollTo({
            left: centerOffset,
            behavior: behavior
        });
    }

    // Silently reset position back to the center block
    function stabilizePosition() {
        const totalOriginals = originalItems.length;
        const middleSetStart = totalOriginals * 3;
        
        // If we've drifted into the outer clones, snap silently back to the middle block
        if (currentIndex < totalOriginals * 2 || currentIndex >= totalOriginals * 4) {
            currentIndex = middleSetStart + (currentIndex % totalOriginals);
            scrollToIndex(currentIndex, "auto"); // Instant reset with zero animation
        }
        isMoving = false;
    }

    // --- AUTO SCROLL LOGIC ---
    function autoMoveRight() {
        if (isMoving) return;
        isMoving = true;
        currentIndex++;
        scrollToIndex(currentIndex, "smooth");
    }

    // Resets the 3.5 second timer
    function resetTimer() {
        clearInterval(autoScrollTimer);
        autoScrollTimer = setInterval(autoMoveRight, 3500);
    }

    // Modern browsers support 'scrollend'
    if ('onscrollend' in window) {
        viewport.addEventListener("scrollend", () => {
            if (isMoving) stabilizePosition();
            resetTimer(); // Reset timer if you manually swiped
        });
    } else {
        // Fallback timer for older browsers
        viewport.addEventListener("scroll", () => {
            clearTimeout(viewport.isScrolling);
            viewport.isScrolling = setTimeout(() => {
                if (isMoving) stabilizePosition();
                resetTimer(); // Reset timer if you manually swiped
            }, 100);
        });
    }

    if (leftBtn) {
        leftBtn.addEventListener("click", () => {
            if (isMoving) return;
            isMoving = true;
            currentIndex--;
            scrollToIndex(currentIndex, "smooth");
            resetTimer(); // Reset timer on click
        });
    }

    if (rightBtn) {
        rightBtn.addEventListener("click", () => {
            if (isMoving) return;
            isMoving = true;
            currentIndex++;
            scrollToIndex(currentIndex, "smooth");
            resetTimer(); // Reset timer on click
        });
    }

    // Pause auto-scroll when hovering over the carousel
    viewport.addEventListener("mouseenter", () => clearInterval(autoScrollTimer));
    viewport.addEventListener("mouseleave", resetTimer);

    window.addEventListener("resize", () => {
        scrollToIndex(currentIndex, "auto");
    });

    setInitialPosition();
    resetTimer(); // Start the timer when the page loads
});


// 2. Before/After Image Comparison Slider Logic
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector(".comparison-slider");
    if (!slider) return;

    const beforeImage = slider.querySelector(".image-before");
    const sliderHandle = slider.querySelector(".slider-handle");

    let isDragging = false;

    function updateSlider(clientX) {
        const rect = slider.getBoundingClientRect();
        let offsetX = clientX - rect.left;

        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;

        const percentage = (offsetX / rect.width) * 100;

        sliderHandle.style.left = percentage + "%";
        beforeImage.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
    }

    sliderHandle.addEventListener("mousedown", (e) => {
        isDragging = true;
        e.preventDefault();
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        updateSlider(e.clientX);
    });

    sliderHandle.addEventListener("touchstart", () => {
        isDragging = true;
    });

    window.addEventListener("touchend", () => {
        isDragging = false;
    });

    window.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        updateSlider(e.touches[0].clientX);
    });

    const initialRect = slider.getBoundingClientRect();
    updateSlider(initialRect.left + initialRect.width / 2);
});


// 3. Reusable Popup Modal Logic
function openPopup(popupId) {
    document.body.classList.add('popup-open');
    const mainContent = document.getElementById('main-content');
    const targetPopup = document.getElementById(popupId);
    
    if (mainContent) mainContent.classList.add('blurred');
    if (targetPopup) targetPopup.classList.add('active');
}

function closePopup(popupId) {
    document.body.classList.remove('popup-open');
    const mainContent = document.getElementById('main-content');
    const targetPopup = document.getElementById(popupId);
    
    if (mainContent) mainContent.classList.remove('blurred');
    if (targetPopup) targetPopup.classList.remove('active');
}

// Automatically trigger your vehicle size guide popup when the page opens
window.onload = () => {
    openPopup('bookingPopup');
};

// 4. Contact Form Submission, Confetti & Timer Logic
// 4. Contact Form Submission, Confetti & AJAX Logic
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector('.contact-form');
    const submitBtn = document.querySelector('.submit-btn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Stops page from refreshing

            // Change button state to show it's working
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Collect the form data
            const formData = new FormData(contactForm);

            // Send it to FormSubmit in the background
            fetch(contactForm.action, {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Get the button's exact position for confetti
                    const btnRect = submitBtn.getBoundingClientRect();
                    const xCoord = (btnRect.left + btnRect.width / 2) / window.innerWidth;
                    const yCoord = btnRect.top / window.innerHeight;

                    // Trigger confetti
                    if (typeof confetti === 'function') {
                        confetti({
                            particleCount: 80,
                            spread: 80,
                            startVelocity: 25,
                            gravity: 1.2,
                            origin: { x: xCoord, y: yCoord + 0.05 }
                        });
                    }

                    // Success Button State
                    submitBtn.textContent = 'Sent! 🎉';
                    submitBtn.style.backgroundColor = '#10b981'; // Success green

                    // Reset form and button after 3 seconds
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.disabled = false;
                        contactForm.reset(); 
                    }, 3000);
                } else {
                    // Handle Errors
                    submitBtn.textContent = 'Error. Try Again.';
                    submitBtn.style.backgroundColor = '#ef4444'; // Red
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.disabled = false;
                    }, 3000);
                }
            })
            .catch(error => {
                console.error("Error submitting form:", error);
                submitBtn.textContent = 'Error. Try Again.';
                submitBtn.disabled = false;
            });
        });
    }
});


// 5. FAQ Accordion Logic (Allows multiple open at the same time)
document.addEventListener("DOMContentLoaded", () => {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const answer = btn.nextElementSibling;
            const isActive = item.classList.contains('active');

            if (isActive) {
                // If it's already open, close it
                item.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                // If it's closed, open it without touching the others
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});
// 6. Infinite Review Carousel Logic
/* 6. Infinite Review Carousel Logic with Click-to-Expand Popup
document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".review-batch-cards");
    const viewport = document.querySelector(".review-batch-wrap");
    const leftBtn = document.getElementById("reviewSlideLeft");
    const rightBtn = document.getElementById("reviewSlideRight");

    if (!track || !viewport) return;

    // Create a dynamic modal overlay element for the expanded popup
    const modal = document.createElement("div");
    modal.className = "review-modal-overlay";
    modal.innerHTML = `
        <div class="review-modal-content">
            <button class="review-modal-close">&times;</button>
            <div class="modal-card-body"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalBody = modal.querySelector(".modal-card-body");
    const closeBtn = modal.querySelector(".review-modal-close");

    const originalItems = Array.from(track.children);
    const itemWidth = originalItems[0].offsetWidth;
    const gap = 20;

    // Clone items multiple times on both ends to create a massive buffer
    for (let i = 0; i < 3; i++) {
        originalItems.forEach(item => {
            track.appendChild(item.cloneNode(true));
        });
        originalItems.slice().reverse().forEach(item => {
            track.insertBefore(item.cloneNode(true), track.firstChild);
        });
    }

    let currentIndex = originalItems.length * 3;
    let isMoving = false;
    let autoScrollTimer;

    function setInitialPosition() {
        const viewportWidth = viewport.offsetWidth;
        const targetCard = track.children[currentIndex];
        if (!targetCard) return;
        const cardLeft = targetCard.offsetLeft;
        const centerOffset = cardLeft - (viewportWidth / 2) + (itemWidth / 2);
        viewport.scrollLeft = centerOffset;
    }

    function scrollToIndex(index, behavior = "smooth") {
        const viewportWidth = viewport.offsetWidth;
        const targetCard = track.children[index];
        if (!targetCard) return;

        const cardLeft = targetCard.offsetLeft;
        const centerOffset = cardLeft - (viewportWidth / 2) + (itemWidth / 2);

        viewport.scrollTo({
            left: centerOffset,
            behavior: behavior
        });
    }

    function stabilizePosition() {
        const totalOriginals = originalItems.length;
        const middleSetStart = totalOriginals * 3;

        if (currentIndex < totalOriginals * 2 || currentIndex >= totalOriginals * 4) {
            currentIndex = middleSetStart + (currentIndex % totalOriginals);
            scrollToIndex(currentIndex, "auto");
        }
        isMoving = false;
    }

    function autoMoveRight() {
        if (isMoving) return;
        isMoving = true;
        currentIndex++;
        scrollToIndex(currentIndex, "smooth");
    }

    function resetTimer() {
        clearInterval(autoScrollTimer);
        autoScrollTimer = setInterval(autoMoveRight, 1000);
    }

    if ('onscrollend' in window) {
        viewport.addEventListener("scrollend", () => {
            if (isMoving) stabilizePosition();
            resetTimer();
        });
    } else {
        viewport.addEventListener("scroll", () => {
            clearTimeout(viewport.isScrolling);
            viewport.isScrolling = setTimeout(() => {
                if (isMoving) stabilizePosition();
                resetTimer();
            }, 100);
        });
    }

    if (leftBtn) {
        leftBtn.addEventListener("click", () => {
            if (isMoving) return;
            isMoving = true;
            currentIndex--;
            scrollToIndex(currentIndex, "smooth");
            resetTimer();
        });
    }

    if (rightBtn) {
        rightBtn.addEventListener("click", () => {
            if (isMoving) return;
            isMoving = true;
            currentIndex++;
            scrollToIndex(currentIndex, "smooth");
            resetTimer();
        });
    }

    // PAUSE WHEN HOVERING OVER THE ENTIRE REVIEW VIEWPORT/CARDS AREA
    viewport.addEventListener("mouseenter", () => clearInterval(autoScrollTimer));
    viewport.addEventListener("mouseleave", resetTimer);

    // Non-hardcoded click handler: dynamically copies whatever card is clicked into the popup modal
    track.addEventListener("click", (e) => {
        const clickedCard = e.target.closest(".review-card");
        if (!clickedCard) return;

        // Pause the auto-scroll timer while reading the expanded review popup
        clearInterval(autoScrollTimer);

        // Copy the inner content dynamically, no matter what the card says
        modalBody.innerHTML = clickedCard.innerHTML;
        modal.classList.add("active");
    });

    function closeModal() {
        modal.classList.remove("active");
        resetTimer(); // Resume scrolling when closed
    }

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    window.addEventListener("resize", () => {
        scrollToIndex(currentIndex, "auto");
    });

    setTimeout(() => {
        setInitialPosition();
        resetTimer();
    }, 100);
});*/