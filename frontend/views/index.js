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


function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const locationInput = document.getElementById('locationInput');
  const searchButton = document.querySelector('.search-button');
  const searchWrapper = document.querySelector('.search-wrapper');
  
  const searchTerm = searchInput.value.trim();
  const location = locationInput.value.trim();
  

  const originalButtonContent = searchButton.innerHTML;
  searchButton.innerHTML = '<div class="loading-spinner"></div>';
  searchButton.disabled = true;
  
  if (!searchTerm && !location) {
   
    showSearchError('Please enter a service or location to search');
    searchButton.innerHTML = originalButtonContent;
    searchButton.disabled = false;
    return;
  }
  

  localStorage.setItem('searchTerm', searchTerm);
  localStorage.setItem('searchLocation', location);
  
 
  showSearchSuccess('Searching for handymen...');
  
 
  setTimeout(() => {
    window.location.href = '/public/views/search-handyman.html';
  }, 1000);
}

function showSearchError(message) {
  
  const existingError = document.querySelector('.search-error');
  const existingSuccess = document.querySelector('.search-success');
  if (existingError) existingError.remove();
  if (existingSuccess) existingSuccess.remove();
  
 
  const errorDiv = document.createElement('div');
  errorDiv.className = 'search-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #dc3545;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 10px;
    border-radius: 5px;
    margin-top: 10px;
    text-align: center;
    font-size: 14px;
  `;
  
  const searchWrapper = document.querySelector('.search-wrapper');
  searchWrapper.parentNode.insertBefore(errorDiv, searchWrapper.nextSibling);
  
 
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 3000);
}

function showSearchSuccess(message) {
  
  const existingError = document.querySelector('.search-error');
  const existingSuccess = document.querySelector('.search-success');
  if (existingError) existingError.remove();
  if (existingSuccess) existingSuccess.remove();
  
 
  const successDiv = document.createElement('div');
  successDiv.className = 'search-success';
  successDiv.textContent = message;
  successDiv.style.cssText = `
    color: #155724;
    background: #d4edda;
    border: 1px solid #c3e6cb;
    padding: 10px;
    border-radius: 5px;
    margin-top: 10px;
    text-align: center;
    font-size: 14px;
  `;
  
  const searchWrapper = document.querySelector('.search-wrapper');
  searchWrapper.parentNode.insertBefore(successDiv, searchWrapper.nextSibling);
}

async function loadHandymen() {
  try {
    const container = document.getElementById('handymenContainer');
    
    // Show loading state
    container.innerHTML = '<div class="handymen-loading"><div class="spinner"><i class="fas fa-spinner fa-spin"></i></div><p>Loading handymen...</p></div>';
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/handymen`);
    if (!response.ok) throw new Error('Failed to fetch handymen');

    const handymen = await response.json();

    container.innerHTML = ''; 

    // Limit to 6 handymen for the homepage
    const limitedHandymen = handymen.slice(0, 6);

    limitedHandymen.forEach(handyman => {
      // Generate dynamic star ratings based on actual rating
      let stars = '';
      const rating = parseFloat(handyman.rating) || 0; // Ensure rating is a number
      
      console.log(`Handyman ${handyman.firstName} ${handyman.lastName}: rating = ${handyman.rating}, normalized = ${rating}`);
      
      // Generate 5 stars based on actual rating
      for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
          // Full star
          stars += '<i class="fas fa-star" style="color: #f7931e;"></i>';
        } else if (rating >= i - 0.5) {
          // Half star
          stars += '<i class="fas fa-star-half-alt" style="color: #f7931e;"></i>';
        } else {
          // Empty star
          stars += '<i class="far fa-star" style="color: #f7931e;"></i>';
        }
      }

      // Create handyman item with dynamic data
      const handymanHTML = `
        <a href="/public/views/handyman-profile.html?handymanId=${handyman._id}" class="handyman-link" data-handyman='${JSON.stringify(handyman)}'>
          <div class="handyman-near-you">
            <div class="handyman-image">
        <img src="${Utils.getProfileImageUrl(handyman.profileImage)}" 
                   alt="${handyman.firstName} ${handyman.lastName}">
            </div>
            <div class="handyman-details">
              <p class="handyman-name">${handyman.firstName} ${handyman.lastName}</p>
              <span class="handyman-rating">
                ${stars}
                ${handyman.ratingCount > 0 ? `<span>${handyman.ratingCount}</span>` : ''}
              </span>
              <p class="handyman-skill">${handyman.profession || handyman.job || 'No profession set'}</p>
              <p class="handyman-location">${handyman.location || 'Location not specified'}</p>
            </div>
          </div>
        </a>
      `;

      container.insertAdjacentHTML('beforeend', handymanHTML);
    });

    // Add click event listeners to handyman cards
    container.querySelectorAll('.handyman-link').forEach(card => {
      card.addEventListener('click', (e) => {
        const handymanData = JSON.parse(card.dataset.handyman);
        localStorage.setItem('handyman', JSON.stringify(handymanData));
      });
    });

  } catch (error) {
    console.error('Error loading handymen:', error);
    const container = document.getElementById('handymenContainer');
    container.innerHTML = '<div class="handymen-error"><p>Failed to load handymen. Please try again later.</p></div>';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadHandymen();
  
  
  const searchButton = document.querySelector('.search-button');
  const searchInput = document.getElementById('searchInput');
  const locationInput = document.getElementById('locationInput');
  
  
  searchButton.addEventListener('click', performSearch);
  
 
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  locationInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  // Add input validation and real-time feedback
  searchInput.addEventListener('input', function() {
    const searchWrapper = document.querySelector('.search-wrapper');
    if (this.value.trim()) {
      searchWrapper.style.borderColor = '#f7931e';
    } else {
      searchWrapper.style.borderColor = '#ddd';
    }
  });
  
  locationInput.addEventListener('input', function() {
    const searchWrapper = document.querySelector('.search-wrapper');
    if (this.value.trim()) {
      searchWrapper.style.borderColor = '#f7931e';
    } else {
      searchWrapper.style.borderColor = '#ddd';
    }
  });
  
  // Enhanced service item interactions
  const serviceItems = document.querySelectorAll('.service-item');
  serviceItems.forEach(item => {
    item.addEventListener('click', function() {
      const serviceName = this.querySelector('p').textContent;
      localStorage.setItem('selectedService', serviceName);
      
      // Show feedback
      showSearchSuccess(`Searching for ${serviceName} services...`);
      
      setTimeout(() => {
        window.location.href = '/public/views/search-handyman.html';
      }, 800);
    });
  });
  
  
  const projectLinks = document.querySelectorAll('.project-link');
  projectLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const projectTitle = this.querySelector('.home-project-title').textContent;
      localStorage.setItem('selectedProject', projectTitle);
      
      
      showSearchSuccess(`Searching for ${projectTitle}...`);
      
      setTimeout(() => {
        window.location.href = '/public/views/search-handyman.html';
      }, 800);
    });
  });
  

  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  
  const animatedElements = document.querySelectorAll('.service-item, .home-project, .handyman-near-you');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });
});


const customStyle = document.createElement('style');
customStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #f7931e;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .search-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .search-wrapper {
    transition: border-color 0.3s ease;
  }
`;
document.head.appendChild(customStyle);

