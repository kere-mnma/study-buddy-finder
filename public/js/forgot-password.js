// Handle the forgot password flow (2 steps)
let verifiedEmail = '';

const emailForm = document.getElementById('email-form');
const resetForm = document.getElementById('reset-form');
const errorBox = document.getElementById('error-message');
const successBox = document.getElementById('success-message');
const securityQuestionLabel = document.getElementById('security-question-label');

// Step 1: look up the security question for the given email
emailForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();

  // Hide previous messages
  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  // Client side validation
  if (!email) {
    errorBox.textContent = 'Email is required.';
    errorBox.style.display = 'block';
    return;
  }

  try {
    // Send data to the server
    const response = await fetch('/api/auth/security-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      errorBox.textContent = data.message;
      errorBox.style.display = 'block';
      return;
    }

    // Move to step 2 and show the security question
    verifiedEmail = email;
    securityQuestionLabel.textContent = data.security_question;
    emailForm.style.display = 'none';
    resetForm.style.display = 'block';

  } catch (err) {
    errorBox.textContent = 'Something went wrong. Please try again.';
    errorBox.style.display = 'block';
  }
});

// Step 2: verify the security answer and reset the password
resetForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const security_answer = document.getElementById('security_answer').value.trim();
  const newPassword = document.getElementById('new_password').value;

  // Hide previous messages
  errorBox.style.display = 'none';
  successBox.style.display = 'none';

  // Client side validation
  if (!security_answer || !newPassword) {
    errorBox.textContent = 'All fields are required.';
    errorBox.style.display = 'block';
    return;
  }

  if (newPassword.length < 8) {
    errorBox.textContent = 'Password must be at least 8 characters.';
    errorBox.style.display = 'block';
    return;
  }

  try {
    // Send data to the server
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: verifiedEmail, security_answer, newPassword })
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
