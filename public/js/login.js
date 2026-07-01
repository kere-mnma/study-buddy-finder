// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const errorBox = document.getElementById('error-message');

  // Get form values
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Hide previous messages
  errorBox.style.display = 'none';

  // Client side validation
  if (!email || !password) {
    errorBox.textContent = 'Email and password are required.';
    errorBox.style.display = 'block';
    return;
  }

  try {
    // Send data to the server
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      errorBox.textContent = data.message;
      errorBox.style.display = 'block';
      return;
    }

    // Store user name and ID in session storage for other pages
    sessionStorage.setItem('userName', data.name);
    sessionStorage.setItem('userId', data.userId);

    // Redirect to dashboard
    window.location.href = '/dashboard.html';
  } catch (err) {
    errorBox.textContent = 'Something went wrong. Please try again.';
    errorBox.style.display = 'block';
  }
});