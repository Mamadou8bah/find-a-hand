// Global function for section toggling
window.showSection = function(sectionId) {
  const sections = document.querySelectorAll('div[id$="-section"]');
  sections.forEach(sec => sec.classList.add('hidden'));

  const selected = document.getElementById(sectionId + '-section');
  if (selected) selected.classList.remove('hidden');

  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => item.classList.remove('active'));
  for (const item of menuItems) {
    if (item.getAttribute('onclick')?.includes(sectionId)) {
      item.classList.add('active');
      break;
    }
  }
};

// Logout function
window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    window.location.href = './login-handyman.html';
  }
};

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to access your dashboard.');
    window.location.href = './login-handyman.html';
    return;
  }

  // Load handyman data and populate dashboard
  await loadAndPopulateAllSections();
});

async function fetchCurrentUserData() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in.');
    window.location.href = './login-handyman.html';
    return null;
  }
  
  try {
    const res = await fetch('http://localhost:5000/api/handymen/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        alert('Session expired. Please login again.');
        window.location.href = './login-handyman.html';
        return null;
      }
      throw new Error('Failed to fetch user data');
    }
    
    return await res.json();
  } catch (err) {
    console.error('Error fetching user data:', err);
    alert('Failed to load user data. Please login again.');
    localStorage.removeItem('token');
    window.location.href = './login-handyman.html';
    return null;
  }
}

async function fetchHandymanBookings() {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const res = await fetch('http://localhost:5000/api/handymen/me/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to fetch bookings');
    const bookings = await res.json();
    console.log('Fetched bookings:', bookings);
    return bookings;
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}

async function updateHeaderAndSidebar(user) {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  
  // Update profile images
  document.querySelectorAll('.profile-image').forEach(img => {
    if (user.profileImage) {
      img.src = `http://localhost:5000/${user.profileImage}`;
    } else {
      img.src = '../public/images/handyman-profiles/default-profile.jpg';
    }
  });
  
  // Update all user names throughout the dashboard
  document.querySelectorAll('.user-profile span, .sidebar-title').forEach(el => {
    el.textContent = fullName;
  });
  
  // Update sidebar subtitle
  document.querySelectorAll('.sidebar-subtitle').forEach(el => el.textContent = user.profession || 'Handyman');

  // Update dashboard stats
  const pendingRequests = document.getElementById('pending-request');
  const confirmedBookings = document.getElementById('confirmed-bookings');
  const monthlyEarnings = document.getElementById('monthly-earnings');
  
  // Calculate real stats from bookings
  const bookings = await fetchHandymanBookings();
  console.log('Total bookings found:', bookings.length);
  
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  
  console.log('Pending bookings:', pendingCount);
  console.log('Confirmed bookings:', confirmedCount);
  
  if (pendingRequests) pendingRequests.innerText = ` ${pendingCount}`;
  if (confirmedBookings) confirmedBookings.innerText = ` ${confirmedCount}`;
  if (monthlyEarnings) monthlyEarnings.innerText = `GMD ${(user.monthlyEarnings || 0).toFixed(2)}`;
}

// Populate Account Settings form fields
function updateAccountSection(user) {
  const setValue = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setValue('firstName', user.firstName);
  setValue('lastName', user.lastName);
  setValue('email', user.email);
  setValue('phone', user.phone);
  setValue('address', user.location);
  setValue('city', user.city);
  setValue('state', user.state);
  setValue('hourlyRate', user.hourlyRate);
  setValue('workRadius', user.workRadius);

  // Update profession dropdown
  const professionSelect = document.getElementById('profession');
  if (professionSelect) {
    professionSelect.value = user.profession || '';
  }

  // Update skills
  const skillsInput = document.getElementById('skills');
  if (skillsInput && user.skills) {
    skillsInput.value = Array.isArray(user.skills) ? user.skills.join(', ') : user.skills;
  }

  // Update experience
  const experienceInput = document.getElementById('experience');
  if (experienceInput) {
    experienceInput.value = user.experience || '';
  }

  if (user.availableDays && Array.isArray(user.availableDays)) {
    document.querySelectorAll('.availability-days input[type="checkbox"]').forEach(cb => {
      const day = cb.parentElement.textContent.trim();
      cb.checked = user.availableDays.includes(day);
    });
  }

  if (user.workingHours) {
    const startSelect = document.querySelector('.working-hours select:first-child');
    const endSelect = document.querySelector('.working-hours select:last-child');
    if (startSelect) startSelect.value = user.workingHours.start || startSelect.options[0].value;
    if (endSelect) endSelect.value = user.workingHours.end || endSelect.options[0].value;
  }
}

// Dynamically populate Reviews section
function updateReviewsSection(user) {
  const reviewsContainer = document.querySelector('#reviews-section .reviews-section');
  if (!reviewsContainer) return;

  // Clear existing content
  const sectionHeader = reviewsContainer.querySelector('.section-header');
  reviewsContainer.innerHTML = '';
  if (sectionHeader) reviewsContainer.appendChild(sectionHeader);

  if (!user.reviews || !Array.isArray(user.reviews) || user.reviews.length === 0) {
    reviewsContainer.innerHTML += '<p>No reviews yet.</p>';
    return;
  }

  user.reviews.forEach(review => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-header">
        <div>
            <span class="review-customer">${review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous'}</span>
          <span class="review-rating">
            ${generateStars(review.rating)}
            ${review.rating.toFixed(1)}
          </span>
        </div>
          <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="review-content">${review.comment}</div>
    `;
    reviewsContainer.appendChild(card);
  });

  const ratingSummarySpan = document.querySelector('#reviews-section .rating-summary');
  if (ratingSummarySpan && user.rating && user.reviews.length) {
    ratingSummarySpan.innerHTML = `
      <i class="fas fa-star" style="color: var(--primary-color);"></i>
      ${user.rating.toFixed(1)} (${user.reviews.length} reviews)
    `;
  }
}

function generateStars(rating) {
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      starsHTML += '<i class="fas fa-star"></i>';
    } else if (rating >= i - 0.5) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsHTML += '<i class="far fa-star"></i>';
    }
  }
  return starsHTML;
}

// Populate portfolio items
function updatePortfolioSection(user) {
  const portfolioContainer = document.getElementById('portfolio-items');
  if (!portfolioContainer) return;

  portfolioContainer.innerHTML = '';

  if (!user.portfolioImages || !Array.isArray(user.portfolioImages) || user.portfolioImages.length === 0) {
    portfolioContainer.innerHTML = '<p>No portfolio items yet.</p>';
    return;
  }

  user.portfolioImages.forEach((image, index) => {
    const newItem = document.createElement('div');
    newItem.className = 'portfolio-item';
    newItem.innerHTML = `
      <div class="portfolio-image-container">
        <img src="http://localhost:5000/${image}" alt="Portfolio item ${index + 1}" class="portfolio-image">
      </div>
      <div class="portfolio-details">
        <h3 class="portfolio-title">Portfolio Item ${index + 1}</h3>
        <p class="portfolio-description">Work completed</p>
        <div class="portfolio-actions">
          <button class="btn btn-outline btn-edit">Edit</button>
          <button class="btn btn-danger btn-delete">Delete</button>
        </div>
      </div>
    `;

    newItem.querySelector('.btn-delete').addEventListener('click', () => {
      if (confirm('Delete this portfolio item?')) {
        newItem.remove();
        // TODO: Add API call to delete backend if needed
      }
    });

    portfolioContainer.appendChild(newItem);
  });
}

// Populate Bookings section dynamically
async function updateBookingsSection() {
  const bookings = await fetchHandymanBookings();
  
  // Update both booking tables (dashboard overview and full bookings section)
  const bookingTables = document.querySelectorAll('.bookings-section table tbody');
  
  bookingTables.forEach(tbody => {
  if (!tbody) return;

  tbody.innerHTML = '';

    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No bookings found</td></tr>';
      return;
    }

    // For dashboard overview, show only recent bookings (first 3)
    const bookingsToShow = tbody.closest('#dashboard-section') ? bookings.slice(0, 3) : bookings;

    bookingsToShow.forEach(booking => {
      console.log('Processing booking:', booking);
      
      const tr = document.createElement('tr');

      const dateObj = new Date(booking.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const formattedTime = booking.time || 'N/A';
      
      // Get customer name from populated user data
      const customerName = booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Unknown Customer';

    tr.innerHTML = `
        <td>${customerName}</td>
        <td>${booking.service || 'N/A'}</td>
        <td>${formattedDate} at ${formattedTime}</td>
        <td>${booking.location || 'N/A'}</td>
        <td><span class="status status-${booking.status.toLowerCase()}">${booking.status}</span></td>
        <td>
          ${booking.status === 'Pending' ? 
            `<div class="action-buttons">
              <button class="btn btn-success" onclick="handleBookingAction('${booking._id}', 'confirm', this.parentElement.parentElement)">Approve</button>
              <button class="btn btn-danger" onclick="handleBookingAction('${booking._id}', 'reject', this.parentElement.parentElement)">Reject</button>
            </div>` :
            booking.status === 'Confirmed' ? 
            `<div class="action-buttons">
              <button class="btn btn-outline" onclick="alert('Reschedule functionality coming soon!')">Reschedule</button>
              <button class="btn btn-danger" onclick="handleBookingAction('${booking._id}', 'cancel', this.parentElement.parentElement)">Cancel</button>
            </div>` :
            booking.status === 'Rejected' ? 
            `<div class="action-buttons">
              <button class="btn btn-outline" onclick="alert('View details functionality coming soon!')">View</button>
            </div>` :
            booking.status === 'Completed' ? 
            `<div class="action-buttons">
              <button class="btn btn-outline" onclick="alert('Details functionality coming soon!')">Details</button>
            </div>` :
            ''
          }
      </td>
    `;

      console.log('Created booking row with ID:', booking._id);

    tbody.appendChild(tr);
    });
  });
}

async function handleBookingAction(bookingId, action, rowElement) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login again.');
    window.location.href = './login-handyman.html';
    return;
  }

  try {
    let status;
    switch (action) {
      case 'confirm':
        status = 'confirmed';
        break;
      case 'reject':
        status = 'cancelled';
        break;
      case 'cancel':
        status = 'cancelled';
        break;
      case 'complete':
        status = 'completed';
        break;
      default:
        throw new Error('Invalid action');
    }

    console.log('Sending booking status update:', {
      bookingId,
      bookingIdType: typeof bookingId,
      action,
      status,
      url: `http://localhost:5000/api/handymen/me/bookings/${bookingId}/status`
    });

    const response = await fetch(`http://localhost:5000/api/handymen/me/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.message || 'Failed to update booking status');
    }

    const result = await response.json();
    console.log('Success response:', result);
    alert(result.message || 'Booking status updated successfully');

    // Update the status in the UI
      const statusSpan = rowElement.querySelector('.status');
    if (statusSpan) {
      const newStatus = action === 'confirm' ? 'Confirmed' : 
                       action === 'reject' || action === 'cancel' ? 'Cancelled' : 
                       action === 'complete' ? 'Completed' : 'Unknown';
      statusSpan.textContent = newStatus;
      statusSpan.className = `status status-${newStatus.toLowerCase()}`;
    }

    // Refresh bookings section
    await updateBookingsSection();

  } catch (error) {
    console.error('Error updating booking status:', error);
    alert('Failed to update booking status: ' + error.message);
  }
}

async function saveProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login again.');
    window.location.href = './login-handyman.html';
    return;
  }

  const formData = new FormData();
  
  // Get form values
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const phone = document.getElementById('phone').value;
  const location = document.getElementById('address').value;
  const profession = document.getElementById('profession').value;
  const skills = document.getElementById('skills').value;
  const experience = document.getElementById('experience').value;
  const hourlyRate = document.getElementById('hourlyRate').value;

  // Add profile image if selected
  const profileImage = document.getElementById('profileImage').files[0];
  if (profileImage) {
    formData.append('profileImage', profileImage);
  }

  // Add other fields
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  formData.append('phone', phone);
  formData.append('location', location);
  formData.append('profession', profession);
  formData.append('skills', skills);
  formData.append('experience', experience);
  formData.append('hourlyRate', hourlyRate);

  try {
    const response = await fetch('http://localhost:5000/api/handymen/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) throw new Error('Failed to update profile');

    const result = await response.json();
    alert('Profile updated successfully!');
    
    // Reload user data to reflect changes
    await loadAndPopulateAllSections();

  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile');
  }
}

async function updatePassword() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login again.');
    window.location.href = './login-handyman.html';
    return;
  }

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert('Please fill in all password fields');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('New passwords do not match');
    return;
  }

  if (newPassword.length < 6) {
    alert('New password must be at least 6 characters long');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/handymen/me/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update password');
    }

    alert('Password updated successfully!');
    
    // Clear password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

  } catch (error) {
    console.error('Error updating password:', error);
    alert(error.message || 'Failed to update password');
  }
}

// Render the schedule calendar dynamically
async function renderScheduleCalendar() {
  const calendarContainer = document.getElementById('schedule-calendar');
  if (!calendarContainer) return;
  calendarContainer.innerHTML = '';

  const bookings = await fetchHandymanBookings();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Get first and last day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Get the weekday index of the first day (0=Sun, 6=Sat)
  const startDay = firstDay.getDay();

  // Add weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekdays.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = day;
    calendarContainer.appendChild(header);
  });

  // Fill in blank days before the 1st
  for (let i = 0; i < startDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-day blank';
    calendarContainer.appendChild(blank);
  }

  // Group bookings by day
  const bookingsByDay = {};
  bookings.forEach(b => {
    const d = new Date(b.date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!bookingsByDay[day]) bookingsByDay[day] = [];
      bookingsByDay[day].push(b);
    }
  });

  // Render each day
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    if (day === now.getDate()) dayDiv.classList.add('today');
    if (bookingsByDay[day]) dayDiv.classList.add('has-bookings');
    dayDiv.textContent = day;

    // Add booking events
    if (bookingsByDay[day]) {
      bookingsByDay[day].forEach(b => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'booking-event';
        eventDiv.textContent = `${b.service} - ${b.time}`;
        dayDiv.appendChild(eventDiv);
      });
    }
    calendarContainer.appendChild(dayDiv);
  }
}

// Render today's bookings in the table
async function renderTodaysBookings() {
  const tbody = document.getElementById('todays-bookings');
  if (!tbody) return;
  tbody.innerHTML = '';

  const bookings = await fetchHandymanBookings();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const todays = bookings.filter(b => {
    const d = new Date(b.date);
    return d.toISOString().slice(0, 10) === todayStr;
  });

  if (todays.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6" style="text-align:center;">No bookings for today</td>';
    tbody.appendChild(tr);
    return;
  }

  todays.forEach(b => {
    const tr = document.createElement('tr');
    const customer = b.user ? `${b.user.firstName} ${b.user.lastName}` : 'Unknown';
    tr.innerHTML = `
      <td>${b.time}</td>
      <td>${customer}</td>
      <td>${b.service}</td>
      <td>${b.location}</td>
      <td><span class="status status-${b.status.toLowerCase()}">${b.status}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-outline" onclick="alert('Details coming soon!')">Details</button>
          <button class="btn btn-danger" onclick="handleBookingAction('${b._id}', 'cancel', this.parentElement.parentElement)">Cancel</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Calculate earnings from bookings
function calculateEarnings(bookings) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let thisMonthEarnings = 0;
  let lastMonthEarnings = 0;
  let totalEarnings = 0;
  
  bookings.forEach(booking => {
    if (booking.status === 'Completed') {
      const bookingDate = new Date(booking.date);
      const bookingMonth = bookingDate.getMonth();
      const bookingYear = bookingDate.getFullYear();
      
      // Calculate earnings based on hourly rate (assuming $75/hour as default)
      const hourlyRate = 75; // This could come from handyman profile
      const duration = 2; // Default 2 hours per booking, could be stored in booking
      const earnings = hourlyRate * duration;
      
      totalEarnings += earnings;
      
      if (bookingMonth === currentMonth && bookingYear === currentYear) {
        thisMonthEarnings += earnings;
      } else if (bookingMonth === (currentMonth - 1) && bookingYear === currentYear) {
        lastMonthEarnings += earnings;
      }
    }
  });
  
  return {
    thisMonth: thisMonthEarnings,
    lastMonth: lastMonthEarnings,
    total: totalEarnings
  };
}

// Update earnings cards
function updateEarningsCards(earnings) {
  const thisMonthEl = document.getElementById('this-month-earnings');
  const lastMonthEl = document.getElementById('last-month-earnings');
  const totalEl = document.getElementById('total-earnings');
  
  if (thisMonthEl) thisMonthEl.textContent = `$${earnings.thisMonth.toFixed(2)}`;
  if (lastMonthEl) lastMonthEl.textContent = `$${earnings.lastMonth.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${earnings.total.toFixed(2)}`;
}

// Render earnings history table
function renderEarningsHistory(bookings) {
  const tbody = document.getElementById('earnings-history');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  // Filter completed bookings and sort by date
  const completedBookings = bookings
    .filter(b => b.status === 'Completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (completedBookings.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6" style="text-align:center;">No completed bookings yet</td>';
    tbody.appendChild(tr);
    return;
  }
  
  completedBookings.forEach(booking => {
    const tr = document.createElement('tr');
    const bookingDate = new Date(booking.date);
    const customer = booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Unknown';
    
    // Calculate earnings (assuming $75/hour, 2 hours per booking)
    const hourlyRate = 75;
    const duration = 2;
    const earnings = hourlyRate * duration;
    
    tr.innerHTML = `
      <td>${bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td>${customer}</td>
      <td>${booking.service}</td>
      <td>${duration} hours</td>
      <td>$${earnings.toFixed(2)}</td>
      <td><span class="status status-completed">Paid</span></td>
    `;
    
    tbody.appendChild(tr);
  });
}

// Update earnings section
async function updateEarningsSection() {
  const bookings = await fetchHandymanBookings();
  const earnings = calculateEarnings(bookings);
  
  updateEarningsCards(earnings);
  renderEarningsHistory(bookings);
}

// Call these when loading the dashboard
async function loadAndPopulateAllSections() {
  const user = await fetchCurrentUserData();
  if (!user) return;

  // Update header and sidebar
  await updateHeaderAndSidebar(user);
  
  // Update account section
  updateAccountSection(user);
  
  // Update reviews section
  updateReviewsSection(user);
  
  // Update portfolio section
  updatePortfolioSection(user);
  
  // Update bookings section
  await updateBookingsSection();

  // Update schedule section
  await renderScheduleCalendar();
  await renderTodaysBookings();

  // Update earnings section
  await updateEarningsSection();
}

// Add event listeners for form submissions
document.addEventListener('DOMContentLoaded', function() {
  // Profile form submission
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveProfile();
    });
  }

  // Password form submission
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      updatePassword();
    });
  }
});
