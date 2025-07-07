// Fetch and display all handymen
async function fetchHandymen() {
  const tableBody = document.querySelector('#handymenTable tbody');
  tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/handymen`);
    if (!response.ok) throw new Error('Failed to fetch handymen');
    const handymen = await response.json();
    if (!Array.isArray(handymen) || handymen.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">No handymen found.</td></tr>';
      return;
    }
    tableBody.innerHTML = '';
    handymen.forEach(handyman => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img class="profile-img" src="${Utils.getProfileImageUrl(handyman.profileImage)}" alt="Profile"></td>
        <td>${handyman.name || handyman.fullName || '-'}</td>
        <td>${handyman.email || '-'}</td>
        <td>${handyman.phone || '-'}</td>
        <td><button class="delete-btn" data-id="${handyman._id}"><i class="fas fa-trash"></i> Delete</button></td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    showNotification('Error loading handymen: ' + err.message, 'error');
    tableBody.innerHTML = '<tr><td colspan="5">Error loading handymen.</td></tr>';
  }
}

// Delete a handyman by ID
async function deleteHandyman(id) {
  if (!confirm('Are you sure you want to delete this handyman?')) return;
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/handymen/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete handyman');
    showNotification('Handyman deleted successfully', 'success');
    fetchHandymen();
  } catch (err) {
    showNotification('Error deleting handyman: ' + err.message, 'error');
  }
}

// Show notification
function showNotification(message, type = 'success') {
  const notificationDiv = document.getElementById('notification');
  notificationDiv.innerHTML = `<div class="notification ${type}">${message}</div>`;
  setTimeout(() => { notificationDiv.innerHTML = ''; }, 3000);
}

// Event delegation for delete buttons
document.addEventListener('DOMContentLoaded', () => {
  fetchHandymen();
  document.querySelector('#handymenTable tbody').addEventListener('click', function(e) {
    if (e.target.closest('.delete-btn')) {
      const id = e.target.closest('.delete-btn').getAttribute('data-id');
      deleteHandyman(id);
    }
  });
}); 