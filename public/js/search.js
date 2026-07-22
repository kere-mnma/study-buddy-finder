// Handle search button click
document.getElementById('search-btn').addEventListener('click', async function() {
  const errorBox = document.getElementById('error-message');
  const resultsContainer = document.getElementById('search-results');

  const keyword = document.getElementById('keyword').value.trim();
  const location = document.getElementById('location-filter').value;

  errorBox.style.display = 'none';

  if (!keyword) {
    errorBox.textContent = 'Please enter a search keyword.';
    errorBox.style.display = 'block';
    return;
  }

  try {
    const response = await fetch(`/api/profile/search?keyword=${encodeURIComponent(keyword)}&location=${location}`);
    const data = await response.json();

    if (!response.ok) {
      errorBox.textContent = data.message;
      errorBox.style.display = 'block';
      return;
    }

    const results = data.results;

    if (!results || results.length === 0) {
      resultsContainer.innerHTML = '<p class="empty-msg">No study buddies found matching your search.</p>';
      return;
    }

    resultsContainer.innerHTML = results.map(buddy => `
      <div class="buddy-card">
        <div class="buddy-avatar">${buddy.full_name.charAt(0)}</div>
        <div class="buddy-info">
          <div class="buddy-name">${buddy.full_name}</div>
          <div class="buddy-sub">${buddy.course} — ${buddy.modules} (${buddy.study_location})</div>
        </div>
        <div class="buddy-actions">
          <button class="btn-send" onclick="sendRequest(${buddy.id})">Send Study Request</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    errorBox.textContent = 'Something went wrong. Please try again.';
    errorBox.style.display = 'block';
  }
});

// Send a connection request
async function sendRequest(receiverId) {
  try {
    const response = await fetch('/api/connections/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId })
    });
    const data = await response.json();
    alert(data.message);
  } catch (err) {
    alert('Something went wrong. Please try again.');
  }
}

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