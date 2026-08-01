// Warn the user before their session expires due to inactivity
const SESSION_WARNING_MS = 25 * 60 * 1000; // 25 minutes
let sessionWarningTimer;

function showSessionWarning() {
  let banner = document.getElementById('session-warning-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'session-warning-banner';
    banner.className = 'session-warning-banner';
    banner.textContent = 'Your session will expire soon due to inactivity.';
    document.body.appendChild(banner);
  }
  banner.style.display = 'block';
}

function hideSessionWarning() {
  const banner = document.getElementById('session-warning-banner');
  if (banner) banner.style.display = 'none';
}

function resetSessionTimer() {
  hideSessionWarning();
  clearTimeout(sessionWarningTimer);
  sessionWarningTimer = setTimeout(showSessionWarning, SESSION_WARNING_MS);
}

['mousemove', 'keydown', 'click', 'scroll'].forEach(function(eventName) {
  document.addEventListener(eventName, resetSessionTimer);
});

resetSessionTimer();
