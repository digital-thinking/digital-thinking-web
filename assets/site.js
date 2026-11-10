// digital-thinking.de — small helpers.
// E-mail, postal address and VAT ID are stored reversed in the markup and never
// appear as plain text in the HTML. They are only assembled after the first real
// interaction (pointer, key, touch, mouse wheel), so a bot that just loads the page,
// even one that runs JavaScript, does not get them.
(function () {
  'use strict';

  var rev = function (s) { return (s || '').split('').reverse().join(''); };
  var EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel', 'focusin'];
  var revealed = false;

  function reveal(e) {
    if (revealed) return;
    // Browsers fire a synthetic pointermove when content scrolls under a resting
    // cursor. That is not a person, so it does not count.
    if (e && e.type === 'pointermove' && !e.movementX && !e.movementY) return;
    revealed = true;
    EVENTS.forEach(function (e) { window.removeEventListener(e, reveal, true); });

    var address = '';
    document.querySelectorAll('[data-mail]').forEach(function (el) {
      address = rev(el.dataset.u) + '@' + rev(el.dataset.d);
      var href = 'mailto:' + address;
      if (el.dataset.subject) href += '?subject=' + encodeURIComponent(el.dataset.subject);
      el.setAttribute('href', href);
      var text = el.querySelector('[data-mail-text]');
      if (text) text.textContent = address;
    });

    // "Copy address": for visitors whose browser has no mail client configured.
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      if (!address || !navigator.clipboard) return;
      var label = btn.textContent;
      var timer;
      btn.hidden = false;
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(address).then(function () {
          btn.textContent = btn.dataset.done;
          clearTimeout(timer);
          timer = setTimeout(function () { btn.textContent = label; }, 2200);
        });
      });
    });

    // Legal pages: postal address and VAT ID.
    document.querySelectorAll('[data-addr]').forEach(function (el) {
      el.textContent = '';
      [el.dataset.l1, el.dataset.l2].forEach(function (line, i) {
        if (i) el.appendChild(document.createElement('br'));
        el.appendChild(document.createTextNode(rev(line)));
      });
    });
    document.querySelectorAll('[data-vat]').forEach(function (el) {
      el.textContent = rev(el.dataset.vat);
    });
  }

  EVENTS.forEach(function (e) {
    window.addEventListener(e, reveal, { capture: true, passive: true });
  });

  // Language links: remember an explicit choice and keep the current section.
  document.querySelectorAll('[data-setlang]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('dt-lang', a.dataset.setlang); } catch (e) {}
      if (location.hash && a.getAttribute('href').indexOf('#') === -1) {
        a.setAttribute('href', a.getAttribute('href') + location.hash);
      }
    });
  });
})();
