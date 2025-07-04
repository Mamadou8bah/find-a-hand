// Search bar placeholder update based on screen size
function updatePlaceholders() {
  const width = window.innerWidth;
  const searchInput = document.getElementById('searchInput');
  const locationInput = document.getElementById('locationInput');
  
  if (width <= 570) {
    searchInput.placeholder = "Search";
    locationInput.placeholder = "Location";
  } else {
    searchInput.placeholder = "What can we help you with ?";
    locationInput.placeholder = "Enter Location";
  }
}

window.addEventListener('load', updatePlaceholders);
window.addEventListener('resize', updatePlaceholders);

// For sidebar
function showSidebar() {
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'flex'
}

function hideSidebar(){
  const sidebar = document.querySelector('.sidebar')
  sidebar.style.display = 'none'
}


  async function loadHandymen() {
    try {
      const response = await fetch('http://localhost:5000/api/handymen');
      if (!response.ok) throw new Error('Failed to fetch handymen');

      const handymen = await response.json();

      const container = document.getElementById('handymenContainer');
      container.innerHTML = ''; // clear any existing content

      handymen.forEach(handyman => {
        // Build star rating HTML
        let stars = '';
        for (let i = 1; i <= 5; i++) {
          if (handyman.rating >= i) {
            stars += '<i class="fas fa-star" style="color: orange;"></i>';
          } else if (handyman.rating >= i - 0.5) {
            stars += '<i class="fas fa-star-half-alt" style="color: orange;"></i>';
          } else {
            stars += '<i class="far fa-star" style="color: orange;"></i>';
          }
        }

        // Create handyman item
        const handymanHTML = `
          <a href="handyman-profile.html?handymanId=${handyman._id}" class="handyman-link">
            <div class="handyman-near-you">
              <div class="handyman-image">
                <img src="${handyman.profileImage ? 'http://localhost:5000/' + handyman.profileImage : '../public/images/handyman-profiles/default-profile.jpg'}" alt="${handyman.firstName} ${handyman.lastName}">
              </div>
              <div class="handyman-details">
                <p class="handyman-name">${handyman.firstName} ${handyman.lastName}</p>
                <span class="handyman-rating">
                  ${stars}
                  <span>${handyman.ratingCount || 0}</span>
                </span>
                <p class="handyman-skill">${handyman.profession || handyman.job || 'No profession set'}</p>
                <p class="handyman-location">${handyman.location || 'Location not specified'}</p>
              </div>
            </div>
          </a>
        `;

        container.insertAdjacentHTML('beforeend', handymanHTML);
      });

    } catch (error) {
      console.error('Error loading handymen:', error);
      document.getElementById('handymenContainer').innerHTML = '<p>Failed to load handymen.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', loadHandymen);

