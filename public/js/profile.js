// Toggle between the Profile Info and Preferences tabs
const tabProfileInfoBtn = document.getElementById('tab-profile-info');
const tabPreferencesBtn = document.getElementById('tab-preferences');
const profileInfoPanel = document.getElementById('profile-info-panel');
const preferencesPanel = document.getElementById('preferences-panel');

tabProfileInfoBtn.addEventListener('click', function() {
  tabProfileInfoBtn.classList.add('active');
  tabPreferencesBtn.classList.remove('active');
  profileInfoPanel.style.display = 'block';
  preferencesPanel.style.display = 'none';
});

tabPreferencesBtn.addEventListener('click', function() {
  tabPreferencesBtn.classList.add('active');
  tabProfileInfoBtn.classList.remove('active');
  profileInfoPanel.style.display = 'none';
  preferencesPanel.style.display = 'block';
});

// Load current profile data when page opens
window.addEventListener('DOMContentLoaded', async function() {
  const errorBox = document.getElementById('error-message');
  const successBox = document.getElementById('success-message');

  const userId = sessionStorage.getItem('userId');

  if (!userId) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch(`/api/profile/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      window.location.href = '/login.html';
      return;
    }

    document.getElementById('full_name').value = data.full_name;
    document.getElementById('email').value = data.email;
    document.getElementById('course').value = data.course || '';
    document.getElementById('modules').value = data.modules || '';
    document.getElementById('study_location').value = data.study_location || 'both';
    document.getElementById('bio').value = data.bio || '';
    renderAvatar(data.profile_picture, data.full_name);
  } catch (err) {
    errorBox.textContent = 'Could not load profile.';
    errorBox.style.display = 'block';
  }
});

// Show the profile picture, or an initial-letter avatar if none is set
function renderAvatar(profilePicture, fullName) {
  const displayDiv = document.getElementById('profile-picture-display');
  if (profilePicture) {
    displayDiv.innerHTML = `<img src="${profilePicture}" alt="Profile picture" class="profile-avatar-img" />`;
  } else {
    displayDiv.innerHTML = `<div class="profile-avatar">${fullName.charAt(0)}</div>`;
  }
}

// Upload a new profile picture
document.getElementById('upload-picture-btn').addEventListener('click', async function() {
  const errorBox = document.getElementById('error-message');
  const successBox = document.getElementById('success-message');
  const fileInput = document.getElementById('profile_picture_input');

  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  const file = fileInput.files[0];
  if (!file) {
    errorBox.textContent = 'Please choose an image to upload.';
    errorBox.style.display = 'block';
    return;
  }

  const formData = new FormData();
  formData.append('profile_picture', file);

  try {
    const response = await fetch('/api/profile/upload-picture', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (!response.ok) {
      errorBox.textContent = data.message;
      errorBox.style.display = 'block';
      return;
    }

    successBox.textContent = data.message;
    successBox.style.display = 'block';
    renderAvatar(data.profile_picture, document.getElementById('full_name').value);
  } catch (err) {
    errorBox.textContent = 'Something went wrong. Please try again.';
    errorBox.style.display = 'block';
  }
});

// Handle profile form submission
document.getElementById('profile-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const errorBox = document.getElementById('error-message');
  const successBox = document.getElementById('success-message');

  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  const course = document.getElementById('course').value.trim();
  const modules = document.getElementById('modules').value.trim();
  const study_location = document.getElementById('study_location').value;
  const bio = document.getElementById('bio').value.trim();

  if (!course || !modules) {
    errorBox.textContent = 'Course and at least one module are required.';
    errorBox.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course, modules, study_location, bio })
    });
    const data = await response.json();

    if (!response.ok) {
      errorBox.textContent = data.message;
      errorBox.style.display = 'block';
      return;
    }

    successBox.textContent = data.message;
    successBox.style.display = 'block';
  } catch (err) {
    errorBox.textContent = 'Something went wrong. Please try again.';
    errorBox.style.display = 'block';
  }
});

// Delete account button
document.getElementById('delete-account-btn').addEventListener('click', async function() {
  const confirmed = confirm('Are you sure you want to permanently delete your account? This cannot be undone.');
  if (!confirmed) return;

  try {
    const response = await fetch('/api/auth/deactivate', { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    sessionStorage.clear();
    window.location.href = '/login.html';
  } catch (err) {
    alert('Something went wrong. Please try again.');
  }
});

// Load current settings when the page opens
window.addEventListener('DOMContentLoaded', async function() {
  const errorBox = document.getElementById('settings-error-message');

  try {
    const response = await fetch('/api/settings');
    const data = await response.json();

    if (!response.ok) {
      window.location.href = '/login.html';
      return;
    }

    const themeInput = document.getElementById(`theme-${data.theme}`);
    if (themeInput) themeInput.checked = true;

    // Reconcile the locally-applied theme with the server's saved value
    window.applyThemePreference(data.theme);

    document.getElementById('push-notifications').checked = !!data.push_notifications;
    document.getElementById('email-notifications').checked = !!data.email_notifications;
    document.getElementById('sound-effects').checked = !!data.sound_effects;
  } catch (err) {
    errorBox.textContent = 'Could not load settings.';
    errorBox.style.display = 'block';
  }
});

// Save settings
document.getElementById('save-settings-btn').addEventListener('click', async function() {
  const errorBox = document.getElementById('settings-error-message');
  const successBox = document.getElementById('settings-success-message');

  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  const themeInput = document.querySelector('input[name="theme"]:checked');
  const theme = themeInput ? themeInput.value : 'dark';
  const push_notifications = document.getElementById('push-notifications').checked;
  const email_notifications = document.getElementById('email-notifications').checked;
  const sound_effects = document.getElementById('sound-effects').checked;

  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, push_notifications, email_notifications, sound_effects })
    });
    const data = await response.json();

    if (!response.ok) {
      errorBox.textContent = data.message;
      errorBox.style.display = 'block';
      return;
    }

    successBox.textContent = data.message;
    successBox.style.display = 'block';

    // Apply the new theme immediately, without needing a page reload
    window.applyThemePreference(theme);
  } catch (err) {
    errorBox.textContent = 'Something went wrong. Please try again.';
    errorBox.style.display = 'block';
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