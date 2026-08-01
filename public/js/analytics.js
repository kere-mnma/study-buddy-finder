// Load analytics data when the page opens
window.addEventListener('DOMContentLoaded', async function() {
  const confirmedCount = document.getElementById('confirmed-buddies-count');
  const sentCount = document.getElementById('requests-sent-count');
  const receivedCount = document.getElementById('requests-received-count');

  try {
    const response = await fetch('/api/connections/analytics');
    const data = await response.json();

    if (!response.ok) {
      window.location.href = '/login.html';
      return;
    }

    confirmedCount.textContent = data.confirmedBuddies;
    sentCount.textContent = data.requestsSent;
    receivedCount.textContent = data.requestsReceived;
  } catch (err) {
    // Leave the stat tiles at their default of 0 if analytics can't load
  }
});

// Logout button
document.getElementById('logout-btn').addEventListener('click', async function() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    sessionStorage.clear();
    window.location.href = '/login.html';
  } catch (err) {
    alert('Logout failed. Please try again.');
  }
});
