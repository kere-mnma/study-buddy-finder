// Format a session_date (DATE column) for display
function formatSessionDate(sessionDate) {
  const date = new Date(sessionDate);
  return date.toLocaleDateString();
}

// Format a session_time (TIME column, e.g. "14:30:00") for display
function formatSessionTime(sessionTime) {
  if (!sessionTime) return '';
  return sessionTime.slice(0, 5);
}

// Small colored dot to show session status
function statusDotHtml(status) {
  const colors = {
    proposed: '#f59e0b',
    confirmed: '#34d399',
  };
  const color = colors[status] || '#9a9aa2';
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${color};margin-right:6px;"></span>`;
}

// Load upcoming study sessions when the Home page opens
window.addEventListener('DOMContentLoaded', async function() {
  const sessionsContainer = document.getElementById('upcoming-sessions');
  const currentUserId = Number(sessionStorage.getItem('userId'));

  try {
    const response = await fetch('/api/sessions/mine');
    const data = await response.json();

    if (!response.ok) return;

    const sessions = data.sessions;

    if (!sessions || sessions.length === 0) {
      sessionsContainer.innerHTML = '<p class="empty-msg">No upcoming study sessions.</p>';
      return;
    }

    sessionsContainer.innerHTML = sessions.map(session => {
      const canRespond = session.status === 'proposed' && session.proposed_by !== currentUserId;
      const actions = canRespond
        ? `<div class="buddy-actions">
             <button class="btn-accept" onclick="respondToSession(${session.id}, 'confirm')">Confirm</button>
             <button class="btn-decline" onclick="respondToSession(${session.id}, 'decline')">Decline</button>
           </div>`
        : '';

      return `
        <div class="buddy-card">
          <div class="buddy-info">
            <div class="buddy-name">${session.buddy_name}</div>
            <div class="buddy-sub">${formatSessionDate(session.session_date)} at ${formatSessionTime(session.session_time)} — ${session.location}</div>
            <div class="buddy-last-active">${statusDotHtml(session.status)}${session.status.charAt(0).toUpperCase() + session.status.slice(1)}</div>
          </div>
          ${actions}
        </div>
      `;
    }).join('');
  } catch (err) {
    sessionsContainer.innerHTML = '<p class="empty-msg">Could not load study sessions.</p>';
  }
});

// Show or hide the inline propose-session form for a given buddy connection
function toggleProposeForm(connectionId) {
  const form = document.getElementById(`propose-form-${connectionId}`);
  if (!form) return;
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Submit a new study session proposal
async function submitProposeSession(connectionId) {
  const dateInput = document.getElementById(`propose-date-${connectionId}`);
  const timeInput = document.getElementById(`propose-time-${connectionId}`);
  const locationInput = document.getElementById(`propose-location-${connectionId}`);

  const session_date = dateInput.value;
  const session_time = timeInput.value;
  const location = locationInput.value.trim();

  if (!session_date || !session_time || !location) {
    alert('Date, time, and location are all required.');
    return;
  }

  try {
    const response = await fetch('/api/sessions/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId, session_date, session_time, location })
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    window.location.reload();
  } catch (err) {
    alert('Something went wrong. Please try again.');
  }
}

// Confirm or decline a proposed study session
async function respondToSession(sessionId, action) {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    window.location.reload();
  } catch (err) {
    alert('Something went wrong. Please try again.');
  }
}
