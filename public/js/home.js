// Show the profile picture, or an initial-letter avatar if none is set
function buddyAvatarHtml(buddy) {
  if (buddy.profile_picture) {
    return `<img src="${buddy.profile_picture}" alt="${buddy.full_name}" class="buddy-avatar-img" />`;
  }
  return `<div class="buddy-avatar">${buddy.full_name.charAt(0)}</div>`;
}

// Load home page data when it opens
window.addEventListener('DOMContentLoaded', async function() {
  const userNameSpan = document.getElementById('user-name');
  const pendingContainer = document.getElementById('pending-requests');
  const sentContainer = document.getElementById('sent-requests');
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

    const { pending, sent, confirmed } = data;

    pendingCount.textContent = pending.length;
    confirmedCount.textContent = confirmed.length;

    // Render pending requests
    if (pending.length === 0) {
      pendingContainer.innerHTML = '<p class="empty-msg">No pending requests.</p>';
    } else {
      pendingContainer.innerHTML = pending.map(req => `
        <div class="buddy-card">
          ${buddyAvatarHtml(req)}
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

    // Render sent requests
    if (sent.length === 0) {
      sentContainer.innerHTML = '<p class="empty-msg">No sent requests.</p>';
    } else {
      sentContainer.innerHTML = sent.map(req => `
        <div class="buddy-card">
          ${buddyAvatarHtml(req)}
          <div class="buddy-info">
            <div class="buddy-name">${req.full_name}</div>
            <div class="buddy-sub">${req.course} — ${req.modules}</div>
          </div>
          <div class="buddy-actions">
            <button class="btn-decline" onclick="withdrawRequest(${req.id})">Cancel Request</button>
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
          ${buddyAvatarHtml(buddy)}
          <div class="buddy-info">
            <div class="buddy-name">${buddy.full_name}</div>
            <div class="buddy-sub">${buddy.course} — ${buddy.modules} (${buddy.study_location})</div>
          </div>
          <div class="buddy-actions">
            <button class="btn-send" onclick="toggleProposeForm(${buddy.connection_id})">Propose Study Session</button>
          </div>
        </div>
        <div id="propose-form-${buddy.connection_id}" class="propose-session-form" style="display: none">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="propose-date-${buddy.connection_id}" />
          </div>
          <div class="form-group">
            <label>Time</label>
            <input type="time" id="propose-time-${buddy.connection_id}" />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input type="text" id="propose-location-${buddy.connection_id}" placeholder="e.g. Library, Zoom link..." />
          </div>
          <button class="btn-accept" onclick="submitProposeSession(${buddy.connection_id})">Send Proposal</button>
        </div>
      `).join('');
    }
  } catch (err) {
    pendingContainer.innerHTML = '<p class="empty-msg">Could not load home page data.</p>';
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

// Withdraw a sent request
async function withdrawRequest(id) {
  try {
    const response = await fetch(`/api/connections/${id}/withdraw`, { method: 'DELETE' });
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