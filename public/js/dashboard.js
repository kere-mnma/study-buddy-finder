// Load dashboard data when page opens
window.addEventListener('DOMContentLoaded', async function() {
  const userNameSpan = document.getElementById('user-name');
  const pendingContainer = document.getElementById('pending-requests');
  const confirmedContainer = document.getElementById('confirmed-buddies');
  const confirmedCount = document.getElementById('confirmed-count');
  const pendingCount = document.getElementById('pending-count');

  // Show stored name immediately
  const storedName = sessionStorage.getItem('userName');
  if (storedName) userNameSpan.textContent = storedName;

  try {
    const response = await fetch('/api/connections/dashboard');
    const data = await response.json();

    if (!response.ok) {
      // Not logged in — send back to login
      window.location.href = '/login.html';
      return;
    }

    const { pending, confirmed } = data;

    pendingCount.textContent = pending.length;
    confirmedCount.textContent = confirmed.length;

    // Render pending requests
    if (pending.length === 0) {
      pendingContainer.innerHTML = '<p class="empty-msg">No pending requests.</p>';
    } else {
      pendingContainer.innerHTML = pending.map(req => `
        <div class="buddy-card">
          <div class="buddy-avatar">${req.full_name.charAt(0)}</div>
          <div class="buddy-info">
            <div class="buddy-name">${req.full_name}</div>
            <div class="buddy-sub">${req.course} — ${req.modules}</div>
          </div>
          <div class="buddy-actions">
            <button class="btn-accept" onclick="respondRequest(${req.id}, 'accept')">Accept</button>
            <button class="btn-decline" onclick="respondRequest(${req.id}, 'decline')">Decline</button>
          </div>
        </div>
      `).join('');
    }

    // Render confirmed buddies
    if (confirmed.length === 0) {
      confirmedContainer.innerHTML = '<p class="empty-msg">No confirmed buddies yet. Go find a study buddy!</p>';
    } else {
      confirmedContainer.innerHTML = confirmed.map(buddy => `
        <div class="buddy-card">
          <div class="buddy-avatar">${buddy.full_name.charAt(0)}</div>
          <div class="buddy-info">
            <div class="buddy-name">${buddy.full_name}</div>
            <div class="buddy-sub">${buddy.course} — ${buddy.modules} (${buddy.study_location})</div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    pendingContainer.innerHTML = '<p class="empty-msg">Could not load dashboard.</p>';
  }
});

// Accept or decline a request
async function respondRequest(id, action) {
  try {
    const response = await fetch(`/api/connections/${id}/${action}`, { method: 'PUT' });
    const data = await response.json();
    if (response.ok) {
      // Reload the page to refresh the lists
      window.location.reload();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Something went wrong. Please try again.');
  }
}

// Logout button
document.getElementById('logout-btn').addEventListener('click', async function() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    sessionStorage.removeItem('userName');
    window.location.href = '/login.html';
  } catch (err) {
    alert('Logout failed. Please try again.');
  }
});