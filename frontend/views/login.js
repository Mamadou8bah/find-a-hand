document.querySelector('.login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      alert('Login successful!');
      localStorage.setItem('token', result.token);
      
      window.location.href = './customer-dashboard.html';
    } else {
      alert(result.message || 'Login failed!');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
