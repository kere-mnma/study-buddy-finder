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
  } catch (err) {
    errorBox.textContent = 'Could not load profile.';
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