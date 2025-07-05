// Configuration for Find-A-Hand Application
const CONFIG = {
  // API Configuration
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000' 
    : 'https://web-production-f6074.up.railway.app', // Your Railway backend URL
  
  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER: 'user',
    USER_TYPE: 'userType',
    HANDYMAN: 'handyman',
    PENDING_HANDYMAN: 'pendingHandyman',
    REDIRECT_AFTER_LOGIN: 'redirectAfterLogin',
    SEARCH_TERM: 'searchTerm',
    SEARCH_LOCATION: 'searchLocation',
    SELECTED_SERVICE: 'selectedService',
    SELECTED_PROJECT: 'selectedProject'
  },

  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    PHONE_MIN_LENGTH: 7,
    PHONE_MAX_LENGTH: 15,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[0-9]{7,15}$/
  },

  // UI Configuration
  UI: {
    ANIMATION_DURATION: 300,
    NOTIFICATION_DURATION: 5000,
    LOADING_TIMEOUT: 10000,
    SEARCH_DEBOUNCE: 500
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    UPLOAD_PATH: '/uploads/'
  },

  // Booking Configuration
  BOOKING: {
    MIN_ADVANCE_HOURS: 2,
    MAX_ADVANCE_DAYS: 30,
    DEFAULT_DURATION: 2, // hours
    CANCELLATION_WINDOW: 24 // hours
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50
  }
};

// Utility Functions
const API = {
  async call(endpoint, options = {}) {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, { 
      ...defaultOptions, 
      ...options 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  // GET request
  async get(endpoint) {
    return this.call(endpoint);
  },

  // POST request
  async post(endpoint, data) {
    return this.call(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // PUT request
  async put(endpoint, data) {
    return this.call(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // DELETE request
  async delete(endpoint) {
    return this.call(endpoint, {
      method: 'DELETE'
    });
  },

  // File upload
  async upload(endpoint, formData) {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    
    const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
};

const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  }
};

const Utils = {
  // Format currency
  formatCurrency(amount, currency = 'GMD') {
    return new Intl.NumberFormat('en-GM', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Format date
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
  },

  // Generate star rating HTML
  generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars += '<i class="fas fa-star" style="color: orange;"></i>';
      } else if (rating >= i - 0.5) {
        stars += '<i class="fas fa-star-half-alt" style="color: orange;"></i>';
      } else {
        stars += '<i class="far fa-star" style="color: orange;"></i>';
      }
    }
    return stars;
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Show notification
  showNotification(message, type = 'info', duration = CONFIG.UI.NOTIFICATION_DURATION) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      ${type === 'success' ? 'background-color: #28a745;' : ''}
      ${type === 'error' ? 'background-color: #dc3545;' : ''}
      ${type === 'warning' ? 'background-color: #ffc107; color: #333;' : ''}
      ${type === 'info' ? 'background-color: #17a2b8;' : ''}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  },

  // Validate email
  isValidEmail(email) {
    return CONFIG.VALIDATION.EMAIL_REGEX.test(email);
  },

  // Validate phone
  isValidPhone(phone) {
    return CONFIG.VALIDATION.PHONE_REGEX.test(phone);
  },

  // Get query parameters
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Set query parameters
  setQueryParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
  }
};

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Export for use in other files
window.CONFIG = CONFIG;
window.API = API;
window.Storage = Storage;
window.Utils = Utils; 