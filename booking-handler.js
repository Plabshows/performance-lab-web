/**
 * Performance Lab — Booking Form Handler
 * Integrates with Formspree for email submissions.
 * 
 * ⚠️  REPLACE 'YOUR_FORM_ID' with your real Formspree form ID.
 * Get it free at: https://formspree.io → New Form → copy the ID.
 * Example: if your endpoint is https://formspree.io/f/xpwzgvqk → ID is xpwzgvqk
 */

const FORMSPREE_ID = 'mreryqob'; // ← Replace this

document.addEventListener('DOMContentLoaded', function () {
    const forms = document.querySelectorAll('#booking-form');
    forms.forEach(function (form) {
        setupForm(form);
    });
});

function setupForm(form) {
    const btn = form.querySelector('button[type="submit"], button:last-of-type');
    const originalBtnText = btn ? btn.innerHTML : 'SEND EVENT BRIEF';

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Basic validation
        const required = form.querySelectorAll('[required]');
        let valid = true;
        required.forEach(function (el) {
            if (!el.value.trim()) {
                el.style.borderColor = '#ff6b6b';
                valid = false;
            } else {
                el.style.borderColor = '';
            }
        });
        if (!valid) return;

        // Loading state
        if (btn) {
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px"><svg style="animation:spin 1s linear infinite;width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>Sending...</span>';
            btn.disabled = true;
        }

        // GA4 event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', { event_category: 'booking', event_label: 'Event Brief' });
        }

        try {
            const formData = new FormData(form);
            const res = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                showFormSuccess(form, btn, originalBtnText);
            } else {
                const json = await res.json();
                const msg = json.errors ? json.errors.map(function (e) { return e.message; }).join(', ') : 'Unknown error';
                showFormError(form, btn, originalBtnText, msg);
            }
        } catch (err) {
            showFormError(form, btn, originalBtnText, 'Network error. Please try again.');
        }
    });
}

function showFormSuccess(form, btn, originalText) {
    form.innerHTML = `
        <div style="text-align:center;padding:40px 0;">
            <svg xmlns="http://www.w3.org/2000/svg" style="width:64px;height:64px;margin:0 auto 16px;display:block;color:#ffb1c1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 style="font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:800;color:white;text-transform:uppercase;letter-spacing:-0.02em;margin-bottom:8px">Brief Received!</h3>
            <p style="color:rgba(255,255,255,0.5);font-family:'Inter',sans-serif;font-size:0.875rem">We'll get back to you within 24 hours. Meanwhile, feel free to reach us on WhatsApp.</p>
            <a href="https://wa.me/34630787144" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:24px;padding:12px 32px;background:#ffb1c1;color:#000;border-radius:8px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none">WhatsApp Us</a>
        </div>
    `;
}

function showFormError(form, btn, originalText, msg) {
    if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
    let errEl = form.querySelector('.form-error-msg');
    if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'form-error-msg';
        errEl.style.cssText = 'color:#ff6b6b;font-size:0.75rem;font-family:Inter,sans-serif;text-align:center;margin-top:8px;';
        form.appendChild(errEl);
    }
    errEl.textContent = '⚠ ' + msg + ' Please try again or contact us on WhatsApp.';
}

// Pack pre-fill utility (used in experiences.html)
window.selectPack = function (packName) {
    var form = document.getElementById('booking-form');
    if (!form) return;

    var textarea = form.querySelector('textarea');
    if (textarea && !textarea.value.trim()) {
        textarea.value = 'Interested in the ' + packName + ' Pack.';
    } else if (textarea && !textarea.value.includes(packName)) {
        textarea.value = '[' + packName + ' Pack] ' + textarea.value;
    }

    var select = form.querySelector('select');
    if (select) { /* keep existing selection */ }

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
