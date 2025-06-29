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