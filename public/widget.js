(function() {
  // 1. Locate the EchoStaff embed script tag
  var script = document.querySelector('script[data-echostaff-widget]');
  if (!script) return;

  var publicKey = script.getAttribute('data-echostaff-widget');
  if (!publicKey) return;

  // 2. Resolve the base domain from the script source URL dynamically
  var widgetOrigin = window.location.origin;
  try {
    var src = script.getAttribute('src');
    if (src && (src.indexOf('http://') === 0 || src.indexOf('https://') === 0)) {
      widgetOrigin = new URL(src).origin;
    }
  } catch (e) {
    console.warn("EchoStaff: Failed to dynamically parse script src origin", e);
  }

  // 3. Avoid duplicate loading
  var iframeId = 'echostaff-widget-iframe';
  if (document.getElementById(iframeId)) return;

  // 4. Create and configure floating iframe
  var iframe = document.createElement('iframe');
  iframe.id = iframeId;
  iframe.title = 'EchoStaff AI Chat Widget';
  iframe.src = widgetOrigin + '/embed/widget/' + publicKey;
  
  // Style properties to isolate and position the widget
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '95px';  // Default size containing bubble only
  iframe.style.height = '95px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '2147483647'; // Max z-index to stay on top
  iframe.style.transition = 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.25s ease, right 0.25s ease, border-radius 0.25s ease';
  iframe.style.background = 'transparent';
  iframe.style.colorScheme = 'light dark';
  iframe.allow = 'microphone'; // Allow voice testing if supported

  // Append to host body
  document.body.appendChild(iframe);

  // 5. Handle postMessage interactions for responsive resize instructions
  window.addEventListener('message', function(event) {
    // Security: Only accept messages originating from the expected EchoStaff domain
    if (event.origin !== widgetOrigin) return;

    // Verify known EchoStaff event structure
    if (event.data && event.data.type === 'echostaff-widget-resize') {
      if (event.data.state === 'open') {
        if (window.innerWidth < 640) {
          // Mobile full viewport overlay
          iframe.style.width = '100vw';
          iframe.style.height = '100vh';
          iframe.style.bottom = '0px';
          iframe.style.right = '0px';
        } else {
          // Desktop open panel constraints
          iframe.style.width = '400px';
          iframe.style.height = '620px';
          iframe.style.bottom = '20px';
          iframe.style.right = '20px';
        }
      } else if (event.data.state === 'closed') {
        // Return to bubble collapsed dimensions
        iframe.style.width = '95px';
        iframe.style.height = '95px';
        iframe.style.bottom = '20px';
        iframe.style.right = '20px';
      }
    }
  });
})();
