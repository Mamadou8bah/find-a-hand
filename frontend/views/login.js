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

    if (!result.token) {
      alert(result.message || 'Login failed');
      return;
    }

    // Save token
    localStorage.setItem('token', result.token);

    // Get user profile
    const userRes = await fetch('http://localhost:5000/api/users/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.token}`
      }
    });

    if (userRes.ok) {
      const userData = await userRes.json();
      localStorage.setItem('user', JSON.stringify(userData));
    }

    alert('Login successful!');
    
    // Check for pending handyman booking
    const pendingHandyman = localStorage.getItem('pendingHandyman');
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    
    // Clear redirect info
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('pendingHandyman');

    // If there was a pending handyman booking, restore it
    if (pendingHandyman) {
      try {
        const handyman = JSON.parse(pendingHandyman);
        localStorage.setItem('handyman', JSON.stringify(handyman));
      } catch (error) {
        console.error('Error parsing pending handyman:', error);
      }
    }

    // Redirect to the original URL or booking page
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else if (pendingHandyman) {
      // If there was a pending booking, go to booking page
      window.location.href = './booking.html';
    } else {
      window.location.href = './customer-dashboard.html';
    }

  } catch (error) {
    alert('Error: ' + error.message);
  }
});
