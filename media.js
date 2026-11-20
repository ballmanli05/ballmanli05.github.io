(function () {
  'use strict';

  var dialog = document.getElementById('media-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var content = dialog.querySelector('.media-content');
  var closeButton = dialog.querySelector('.media-close');
  var error = dialog.querySelector('.media-error');
  var opener = null;
  var backdropPressed = false;

  document.querySelectorAll('[data-media]').forEach(function (link) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', function (event) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      error.hidden = true;
      dialog.querySelector('.media-fallback').href = link.href;
      document.getElementById('media-title').textContent = link.dataset.title;

      var isVideo = link.dataset.media === 'video';
      var media = document.createElement(isVideo ? 'video' : 'img');
      if (isVideo) {
        media.controls = true;
        media.playsInline = true;
        media.preload = 'metadata';
        media.poster = link.dataset.poster;
        media.setAttribute('aria-label', link.dataset.title + ' video');
      } else {
        var sourceImage = link.querySelector('img');
        media.alt = sourceImage.alt;
        if (sourceImage.classList.contains('figure-padded')) {
          media.classList.add('figure-padded');
        }
      }
      media.addEventListener('error', function () { error.hidden = false; });
      content.replaceChildren(media);
      dialog.showModal();
      document.documentElement.classList.add('media-open');
      closeButton.focus();
      // Assign the source only after a deliberate click, never during page load.
      media.src = link.href;
      if (isVideo) {
        media.play().catch(function () {
          // Native controls remain available when the browser blocks autoplay.
        });
      }
    });
  });

  closeButton.addEventListener('click', function () { dialog.close(); });
  function outsideDialog(event) {
    var bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  dialog.addEventListener('pointerdown', function (event) {
    backdropPressed = outsideDialog(event);
  });
  dialog.addEventListener('click', function (event) {
    if (backdropPressed && outsideDialog(event)) dialog.close();
    backdropPressed = false;
  });
  dialog.addEventListener('close', function () {
    var video = content.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    content.replaceChildren();
    document.documentElement.classList.remove('media-open');
    if (opener) opener.focus({ preventScroll: true });
  });
})();
