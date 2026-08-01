// Show the profile picture, or an initial-letter avatar if none is set
function buddyAvatarHtml(buddy) {
  if (buddy.profile_picture) {
    return `<img src="${buddy.profile_picture}" alt="${buddy.full_name}" class="buddy-avatar-img" />`;
  }
  return `<div class="buddy-avatar">${buddy.full_name.charAt(0)}</div>`;
}

// Format a last_active timestamp for display
function formatLastActive(lastActive) {
  if (!lastActive) return 'Last active: unknown';
  const date = new Date(lastActive);
  return `Last active: ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

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
        ${buddyAvatarHtml(buddy)}
        <div class="buddy-info">
          <div class="buddy-name">${buddy.full_name}</div>
          <div class="buddy-sub">${buddy.course} — ${buddy.modules} (${buddy.study_location})</div>
          <div class="buddy-last-active">${formatLastActive(buddy.last_active)}</div>
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

// Toggle between the search view and browse-all view
const tabSearchBtn = document.getElementById('tab-search');
const tabBrowseBtn = document.getElementById('tab-browse');
const searchView = document.getElementById('search-view');
const browseView = document.getElementById('browse-view');

let browsePage = 1;
let browseTotalPages = 1;

tabSearchBtn.addEventListener('click', function() {
  tabSearchBtn.classList.add('active');
  tabBrowseBtn.classList.remove('active');
  searchView.style.display = 'block';
  browseView.style.display = 'none';
});

tabBrowseBtn.addEventListener('click', function() {
  tabBrowseBtn.classList.add('active');
  tabSearchBtn.classList.remove('active');
  searchView.style.display = 'none';
  browseView.style.display = 'block';
  loadBrowseAll(browsePage);
});

// Load a page of all other students
async function loadBrowseAll(page) {
  const browseResults = document.getElementById('browse-results');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');

  try {
    const response = await fetch(`/api/profile/browse-all?page=${page}&limit=10`);
    const data = await response.json();

    if (!response.ok) {
      browseResults.innerHTML = `<p class="empty-msg">${data.message}</p>`;
      return;
    }

    const { results, totalPages } = data;
    browsePage = page;
    browseTotalPages = totalPages;

    if (!results || results.length === 0) {
      browseResults.innerHTML = '<p class="empty-msg">No other students found.</p>';
    } else {
      browseResults.innerHTML = results.map(buddy => `
        <div class="buddy-card">
          ${buddyAvatarHtml(buddy)}
          <div class="buddy-info">
            <div class="buddy-name">${buddy.full_name}</div>
            <div class="buddy-sub">${buddy.course} — ${buddy.modules} (${buddy.study_location})</div>
            <div class="buddy-last-active">${formatLastActive(buddy.last_active)}</div>
          </div>
          <div class="buddy-actions">
            <button class="btn-send" onclick="sendRequest(${buddy.id})">Send Study Request</button>
          </div>
        </div>
      `).join('');
    }

    pageInfo.textContent = `Page ${browsePage} of ${browseTotalPages}`;
    prevBtn.disabled = browsePage <= 1;
    nextBtn.disabled = browsePage >= browseTotalPages;

  } catch (err) {
    browseResults.innerHTML = '<p class="empty-msg">Could not load students.</p>';
  }
}

document.getElementById('prev-page').addEventListener('click', function() {
  if (browsePage > 1) loadBrowseAll(browsePage - 1);
});

document.getElementById('next-page').addEventListener('click', function() {
  if (browsePage < browseTotalPages) loadBrowseAll(browsePage + 1);
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