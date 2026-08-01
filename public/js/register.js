// Handle registration form submission
document.getElementById('register-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const errorBox = document.getElementById('error-message');
  const successBox = document.getElementById('success-message');

  // Get form values
  const full_name = document.getElementById('full_name').value.trim();
  const email = document.getElementById('email').value.trim();
  const course = document.getElementById('course').value.trim();
  const password = document.getElementById('password').value;
  const security_question = document.getElementById('security_question').value;
  const security_answer = document.getElementById('security_answer').value.trim();

  // Hide previous messages
  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  // Client side validation
  if (!full_name || !email || !course || !password || !security_question || !security_answer) {
    errorBox.textContent = 'All fields are required.';
    errorBox.style.display = 'block';
    return;
  }

  if (password.length < 8) {
    errorBox.textContent = 'Password must be at least 8 characters.';
    errorBox.style.display = 'block';
    return;
  }

  try {
    // Send data to the server
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, course, password, security_question, security_answer })
    });

    const data = await response.json();

    if (!response.ok) {
      errorBox.textContent = data.message;
      errorBox.style.display = 'block';
      return;
    }

    // Show success and redirect to login
    successBox.textContent = data.message;
    successBox.style.display = 'block';

    setTimeout(() => {
      window.location.href = '/login.html';
    }, 2000);

  } catch (err) {
    errorBox.textContent = 'Something went wrong. Please try again.';
    errorBox.style.display = 'block';
  }
});