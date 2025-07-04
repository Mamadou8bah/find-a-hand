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
    if (!res.ok) throw new Error('Failed to fetch user data');
    return await res.json();
  } catch (err) {
    console.error(err);
    alert('Failed to load user data. Please login again.');
    localStorage.removeItem('token');
    window.location.href = './login-handyman.html';
    return null;
  }
}

function updateHeaderAndSidebar(user) {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  document.querySelectorAll('.profile-image').forEach(img => {
    if (user.profileImage) {
      img.src = `http://localhost:5000/${user.profileImage}`;
    }
  });
  document.querySelectorAll('.user-profile span').forEach(span => {
    span.textContent = fullName;
  });
  document.querySelectorAll('.sidebar-title').forEach(el => el.textContent = fullName);
  document.querySelectorAll('.sidebar-subtitle').forEach(el => el.textContent = user.profession || '');

  document.getElementById('pending-request').innerText = ` ${user.pendingRequests || 0}`;
  document.getElementById('confirmed-bookings').innerText = ` ${user.confirmedBookings || 0}`;
  document.getElementById('monthly-earnings').innerText = `GMD ${(user.monthlyEarnings || 0).toFixed(2)}`;
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
  if (!user.reviews || !Array.isArray(user.reviews)) return;

  const reviewsContainer = document.querySelector('#reviews-section .reviews-section');
  if (!reviewsContainer) return;

  const sectionHeader = reviewsContainer.querySelector('.section-header');
  reviewsContainer.innerHTML = '';
  if (sectionHeader) reviewsContainer.appendChild(sectionHeader);

  user.reviews.forEach(review => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-header">
        <div>
          <span class="review-customer">${review.customerName}</span>
          <span class="review-rating">
            ${generateStars(review.rating)}
            ${review.rating.toFixed(1)}
          </span>
        </div>
        <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
      </div>
      <div class="review-content">${review.comment}</div>
    `;
    reviewsContainer.appendChild(card);
  });

  const ratingSummarySpan = document.querySelector('#reviews-section .rating-summary');
  if (ratingSummarySpan && user.ratingAverage && user.reviews.length) {
    ratingSummarySpan.innerHTML = `
      <i class="fas fa-star" style="color: var(--primary-color);"></i>
      ${user.ratingAverage.toFixed(1)} (${user.reviews.length} reviews)
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
  if (!user.portfolio || !Array.isArray(user.portfolio)) return;

  const portfolioContainer = document.getElementById('portfolio-items');
  if (!portfolioContainer) return;

  portfolioContainer.innerHTML = '';

  user.portfolio.forEach(item => {
    const newItem = document.createElement('div');
    newItem.className = 'portfolio-item';
    newItem.innerHTML = `
      <div class="portfolio-image-container">
        <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="${item.title}" class="portfolio-image">
      </div>
      <div class="portfolio-details">
        <h3 class="portfolio-title">${item.title}</h3>
        <p class="portfolio-description">${item.description}</p>
        <div class="portfolio-date">Completed: ${new Date(item.completionDate).toLocaleDateString()}</div>
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
function updateBookingsSection(user) {
  if (!user.bookings || !Array.isArray(user.bookings)) return;

  const tbody = document.querySelector('.bookings-section table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  user.bookings.forEach(booking => {
    const tr = document.createElement('tr');

    const dateObj = new Date(booking.datetime);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    let locationText = 'N/A';
    if (booking.distance) {
      locationText = `${booking.distance.toFixed(1)} miles away`;
    } else if (booking.location) {
      locationText = booking.location;
    }

    const statusClassMap = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'Rejected': 'status-rejected',
      'Cancelled': 'status-cancelled',
      'Completed': 'status-completed'
    };
    const statusClass = statusClassMap[booking.status] || 'status-pending';

    let actionButtonsHTML = '';
    switch (booking.status) {
      case 'Pending':
        actionButtonsHTML = `
          <button class="btn btn-success btn-approve">Approve</button>
          <button class="btn btn-danger btn-reject">Reject</button>
        `;
        break;
      case 'Confirmed':
        actionButtonsHTML = `
          <button class="btn btn-outline btn-reschedule">Reschedule</button>
          <button class="btn btn-danger btn-cancel">Cancel</button>
        `;
        break;
      case 'Rejected':
        actionButtonsHTML = `<button class="btn btn-outline btn-view">View</button>`;
        break;
      case 'Completed':
        actionButtonsHTML = `<button class="btn btn-outline btn-details">Details</button>`;
        break;
      default:
        actionButtonsHTML = '';
    }

    tr.innerHTML = `
      <td>${booking.customerName || 'Unknown'}</td>
      <td>${booking.service || 'Unknown'}</td>
      <td>${formattedDate}, ${formattedTime}</td>
      <td>${locationText}</td>
      <td><span class="status ${statusClass}">${booking.status}</span></td>
      <td>
        <div class="action-buttons">${actionButtonsHTML}</div>
      </td>
    `;

    if (booking.status === 'Pending') {
      tr.querySelector('.btn-approve').addEventListener('click', () => handleBookingAction(booking._id, 'approve', tr));
      tr.querySelector('.btn-reject').addEventListener('click', () => handleBookingAction(booking._id, 'reject', tr));
    } else if (booking.status === 'Confirmed') {
      tr.querySelector('.btn-reschedule').addEventListener('click', () => alert('Reschedule functionality coming soon!'));
      tr.querySelector('.btn-cancel').addEventListener('click', () => handleBookingAction(booking._id, 'cancel', tr));
    } else if (booking.status === 'Rejected') {
      tr.querySelector('.btn-view').addEventListener('click', () => alert('View details functionality coming soon!'));
    } else if (booking.status === 'Completed') {
      tr.querySelector('.btn-details').addEventListener('click', () => alert('Details functionality coming soon!'));
    }

    tbody.appendChild(tr);
  });
}

// Handle booking actions (approve/reject/cancel)
async function handleBookingAction(bookingId, action, rowElement) {
  if (!confirm(`Are you sure you want to ${action} this booking?`)) return;

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in.');
    window.location.href = './login-handyman.html';
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/${action}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Action failed');
    }

    alert(`Booking ${action}d successfully!`);

    if (action === 'approve') {
      const statusSpan = rowElement.querySelector('.status');
      statusSpan.textContent = 'Confirmed';
      statusSpan.className = 'status status-confirmed';
      const actionsDiv = rowElement.querySelector('.action-buttons');
      actionsDiv.innerHTML = `
        <button class="btn btn-outline btn-reschedule">Reschedule</button>
        <button class="btn btn-danger btn-cancel">Cancel</button>
      `;
      actionsDiv.querySelector('.btn-reschedule').addEventListener('click', () => alert('Reschedule functionality coming soon!'));
      actionsDiv.querySelector('.btn-cancel').addEventListener('click', () => handleBookingAction(bookingId, 'cancel', rowElement));
    } else if (action === 'reject' || action === 'cancel') {
      rowElement.remove();
    }

  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Save profile updates handler
async function saveProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in.');
    window.location.href = './login-handyman.html';
    return;
  }

  const data = {
    firstName: document.getElementById('firstName')?.value.trim(),
    lastName: document.getElementById('lastName')?.value.trim(),
    email: document.getElementById('email')?.value.trim(),
    phone: document.getElementById('phone')?.value.trim(),
    location: document.getElementById('address')?.value.trim(),
    city: document.getElementById('city')?.value.trim(),
    state: document.getElementById('state')?.value.trim(),
    hourlyRate: Number(document.getElementById('hourlyRate')?.value),
    workRadius: Number(document.getElementById('workRadius')?.value),
    availableDays: Array.from(document.querySelectorAll('.availability-days input[type="checkbox"]:checked'))
                  .map(cb => cb.parentElement.textContent.trim()),
    workingHours: {
      start: document.querySelector('.working-hours select:first-child')?.value,
      end: document.querySelector('.working-hours select:last-child')?.value
    }
  };

  try {
    const res = await fetch('http://localhost:5000/api/handymen/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Update failed');
    }
    alert('Profile updated successfully!');
    await loadAndPopulateAllSections();

  } catch (error) {
    alert('Failed to update profile: ' + error.message);
  }
}

// Password update handler
async function updatePassword() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in.');
    window.location.href = './login-handyman.html';
    return;
  }

  const currentPassword = document.getElementById('currentPassword')?.value;
  const newPassword = document.getElementById('newPassword')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert('Please fill all password fields.');
    return;
  }
  if (newPassword.length < 6) {
    alert('New password must be at least 6 characters.');
    return;
  }
  if (newPassword !== confirmPassword) {
    alert('New password and confirmation do not match.');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/handymen/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Password update failed');
    }

    alert('Password updated successfully!');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

  } catch (err) {
    alert('Password update error: ' + err.message);
  }
}

// Master function to load and update all dashboard sections
async function loadAndPopulateAllSections() {
  const user = await fetchCurrentUserData();
  if (!user) return;

  updateHeaderAndSidebar(user);
  updateAccountSection(user);
  updateReviewsSection(user);
  updatePortfolioSection(user);
  updateBookingsSection(user);
}

document.addEventListener('DOMContentLoaded', () => {
  loadAndPopulateAllSections();

  const saveProfileBtn = document.querySelector('#account-section .btn-primary');
  if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);

  const updatePasswordBtn = document.querySelectorAll('#account-section .btn-primary')[1];
  if (updatePasswordBtn) updatePasswordBtn.addEventListener('click', updatePassword);
});
