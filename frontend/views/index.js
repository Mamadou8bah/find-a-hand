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

// Enhanced search functionality
function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const locationInput = document.getElementById('locationInput');
  const searchButton = document.querySelector('.search-button');
  const searchWrapper = document.querySelector('.search-wrapper');
  
  const searchTerm = searchInput.value.trim();
  const location = locationInput.value.trim();
  
  // Add loading state to search button
  const originalButtonContent = searchButton.innerHTML;
  searchButton.innerHTML = '<div class="loading-spinner"></div>';
  searchButton.disabled = true;
  
  // Validate search input
  if (!searchTerm && !location) {
    // Show error message
    showSearchError('Please enter a service or location to search');
    searchButton.innerHTML = originalButtonContent;
    searchButton.disabled = false;
    return;
  }
  
  // Store search parameters
  localStorage.setItem('searchTerm', searchTerm);
  localStorage.setItem('searchLocation', location);
  
  // Show success feedback
  showSearchSuccess('Searching for handymen...');
  
  // Redirect to search page after a brief delay
  setTimeout(() => {
    window.location.href = 'search-handyman.html';
  }, 1000);
}

function showSearchError(message) {
  // Remove existing messages
  const existingError = document.querySelector('.search-error');
  const existingSuccess = document.querySelector('.search-success');
  if (existingError) existingError.remove();
  if (existingSuccess) existingSuccess.remove();
  
  // Create error message
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
  
  // Remove error after 3 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 3000);
}

function showSearchSuccess(message) {
  // Remove existing messages
  const existingError = document.querySelector('.search-error');
  const existingSuccess = document.querySelector('.search-success');
  if (existingError) existingError.remove();
  if (existingSuccess) existingSuccess.remove();
  
  // Create success message
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
    container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Loading handymen...</div>';
    
    const response = await fetch('http://localhost:5000/api/handymen');
    if (!response.ok) throw new Error('Failed to fetch handymen');

    const handymen = await response.json();

    container.innerHTML = ''; // clear loading content

    // Limit to only 6 handymen
    const limitedHandymen = handymen.slice(0, 6);

    limitedHandymen.forEach(handyman => {
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
    document.getElementById('handymenContainer').innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Failed to load handymen. Please try again later.</div>';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadHandymen();
  
  // Enhanced search functionality
  const searchButton = document.querySelector('.search-button');
  const searchInput = document.getElementById('searchInput');
  const locationInput = document.getElementById('locationInput');
  
  // Add click handler for search button
  searchButton.addEventListener('click', performSearch);
  
  // Add enter key support for search
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
        window.location.href = 'search-handyman.html';
      }, 800);
    });
  });
  
  // Enhanced project card interactions
  const projectLinks = document.querySelectorAll('.project-link');
  projectLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const projectTitle = this.querySelector('.home-project-title').textContent;
      localStorage.setItem('selectedProject', projectTitle);
      
      // Show feedback
      showSearchSuccess(`Searching for ${projectTitle}...`);
      
      setTimeout(() => {
        window.location.href = 'search-handyman.html';
      }, 800);
    });
  });
  
  // Add smooth scroll for navigation links
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
  
  // Add intersection observer for animations
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
  
  // Observe elements for scroll animations
  const animatedElements = document.querySelectorAll('.service-item, .home-project, .handyman-near-you');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });
});

// Add enhanced styles for search functionality
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);

