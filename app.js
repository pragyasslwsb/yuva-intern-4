
'use strict';

/* =========================================================
   PixelForge Studio
   Accessible and Maintainable JavaScript
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    /* -----------------------------------------------------
       1. Select HTML Elements
    ----------------------------------------------------- */

    const body = document.body;

    const menuButton = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');

    const themeButton = document.querySelector('.theme-toggle');

    const faqButtons = document.querySelectorAll('.faq__button');

    const contactForm = document.querySelector('#contact-form');
    const formStatus = document.querySelector('#form-status');

    const currentYear = document.querySelector('#current-year');


    /* -----------------------------------------------------
       2. Mobile Navigation
    ----------------------------------------------------- */

    if (menuButton && navMenu) {
        const setMenuState = (isOpen) => {
            menuButton.setAttribute('aria-expanded', String(isOpen));

            menuButton.setAttribute(
                'aria-label',
                isOpen ? 'Close navigation menu' : 'Open navigation menu'
            );

            navMenu.classList.toggle('is-open', isOpen);
        };

        menuButton.addEventListener('click', () => {
            const isExpanded =
                menuButton.getAttribute('aria-expanded') === 'true';

            setMenuState(!isExpanded);
        });

        // Close the menu after a navigation link is selected.
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                setMenuState(false);
            });
        });

        // Close the menu when Escape is pressed.
        document.addEventListener('keydown', (event) => {
            if (
                event.key === 'Escape' &&
                menuButton.getAttribute('aria-expanded') === 'true'
            ) {
                setMenuState(false);
                menuButton.focus();
            }
        });

        // Close the mobile menu when clicking outside it.
        document.addEventListener('click', (event) => {
            const clickedInsideMenu = navMenu.contains(event.target);
            const clickedMenuButton = menuButton.contains(event.target);

            if (!clickedInsideMenu && !clickedMenuButton) {
                setMenuState(false);
            }
        });

        // Reset the mobile menu when returning to desktop layout.
        const desktopQuery = window.matchMedia('(min-width: 901px)');

        const handleDesktopLayout = (event) => {
            if (event.matches) {
                setMenuState(false);
            }
        };

        if (desktopQuery.addEventListener) {
            desktopQuery.addEventListener('change', handleDesktopLayout);
        } else {
            // Compatibility with older browsers.
            desktopQuery.addListener(handleDesktopLayout);
        }
    }


    /* -----------------------------------------------------
       3. Theme Toggle
    ----------------------------------------------------- */

    if (themeButton) {
        const updateThemeButton = () => {
            const isLightTheme = body.classList.contains('light-theme');

            themeButton.setAttribute(
                'aria-pressed',
                String(isLightTheme)
            );

            themeButton.setAttribute(
                'aria-label',
                isLightTheme
                    ? 'Switch to dark theme'
                    : 'Switch to light theme'
            );

            const label = themeButton.querySelector('.theme-toggle__text');

            if (label) {
                label.textContent = isLightTheme
                    ? 'Light theme'
                    : 'Dark theme';
            }
        };

        themeButton.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            updateThemeButton();
        });

        updateThemeButton();
    }


    /* -----------------------------------------------------
       4. Accessible FAQ Accordion
    ----------------------------------------------------- */

    faqButtons.forEach((button) => {
        const answerId = button.getAttribute('aria-controls');
        const answer = answerId
            ? document.getElementById(answerId)
            : null;

        if (!answer) {
            return;
        }

        // Synchronize initial HTML state.
        const initiallyExpanded =
            button.getAttribute('aria-expanded') === 'true';

        answer.hidden = !initiallyExpanded;

        button.addEventListener('click', () => {
            const isExpanded =
                button.getAttribute('aria-expanded') === 'true';

            const shouldExpand = !isExpanded;

            button.setAttribute(
                'aria-expanded',
                String(shouldExpand)
            );

            answer.hidden = !shouldExpand;
        });
    });


    /* -----------------------------------------------------
       5. Contact Form Validation and Feedback
    ----------------------------------------------------- */

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            // Use the browser's built-in validation.
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();

                formStatus.textContent =
                    'Please complete all required fields correctly.';

                return;
            }

            const formData = new FormData(contactForm);

            const name = String(formData.get('name') || '').trim();

            if (!name) {
                formStatus.textContent =
                    'Please enter your name.';

                contactForm.querySelector('[name="name"]')?.focus();

                return;
            }

            /*
             * This is a frontend demonstration only.
             * No information is sent to a server.
             */

            formStatus.textContent =
                'Your form is valid. This demo does not send messages. ' +
                'Connect a backend or form service to enable submission.';
        });

        // Clear stale feedback when the user edits the form.
        contactForm.addEventListener('input', () => {
            formStatus.textContent = '';
        });
    }


    /* -----------------------------------------------------
       6. Automatic Footer Year
    ----------------------------------------------------- */

    if (currentYear) {
        currentYear.textContent = String(new Date().getFullYear());
    }


    /* -----------------------------------------------------
       7. Smooth In-Page Navigation Fallback
    ----------------------------------------------------- */

    // Native anchor navigation remains functional without JavaScript.
    // CSS controls smooth scrolling when reduced motion is not enabled.
    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (!href || href === '#') {
                return;
            }

            let target;

            try {
                target = document.querySelector(href);
            } catch {
                // Ignore invalid selectors.
                return;
            }

            if (!target) {
                return;
            }

            // Preserve native browser navigation and history.
            // This handler intentionally does not override anchor behavior.
            if (reduceMotion.matches) {
                target.style.scrollBehavior = 'auto';
            }
        });
    });


    /* -----------------------------------------------------
       8. Basic Runtime Diagnostics
    ----------------------------------------------------- */

    // Warn about missing interactive elements during development.
    if (!menuButton || !navMenu) {
        console.warn(
            'PixelForge Studio: Navigation elements were not found.'
        );
    }

    if (!themeButton) {
        console.warn(
            'PixelForge Studio: Theme toggle was not found.'
        );
    }

    if (faqButtons.length === 0) {
        console.info(
            'PixelForge Studio: No FAQ buttons were found.'
        );
    }
});
