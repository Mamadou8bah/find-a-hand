// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Storage Keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  HANDYMAN: 'handyman',
  REDIRECT_AFTER_LOGIN: 'redirectAfterLogin'
};

// Validation Constants
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PHONE_MIN_LENGTH: 7,
  TASK_MAX_LENGTH: 200,
  RATING_MIN: 1,
  RATING_MAX: 5
};

// API Endpoints
const ENDPOINTS = {
  // User endpoints
  USER_REGISTER: `${API_BASE_URL}/users/register`,
  USER_LOGIN: `${API_BASE_URL}/users/login`,
  USER_PROFILE: `${API_BASE_URL}/users/profile`,
  
  // Handyman endpoints
  HANDYMAN_REGISTER: `${API_BASE_URL}/handymen/register`,
  HANDYMAN_LOGIN: `${API_BASE_URL}/handymen/login`,
  HANDYMAN_PROFILE: `${API_BASE_URL}/handymen/me`,
  HANDYMAN_UPDATE: `${API_BASE_URL}/handymen/me`,
  HANDYMAN_ALL: `${API_BASE_URL}/handymen`,
  HANDYMAN_BY_ID: (id) => `${API_BASE_URL}/handymen/${id}`,
  HANDYMAN_BOOKINGS: `${API_BASE_URL}/handymen/me/bookings`,
  HANDYMAN_UPDATE_BOOKING: (id) => `${API_BASE_URL}/handymen/me/bookings/${id}/status`,
  HANDYMAN_REVIEW: (id) => `${API_BASE_URL}/handymen/${id}/reviews`,
  
  // Booking endpoints
  BOOKING_CREATE: `${API_BASE_URL}/bookings`,
  BOOKING_GET_ALL: `${API_BASE_URL}/bookings`,
  BOOKING_GET_BY_ID: (id) => `${API_BASE_URL}/bookings/${id}`,
  BOOKING_CANCEL: (id) => `${API_BASE_URL}/bookings/${id}/cancel`
};

// Utility Functions
const API = {
  async call(endpoint, options = {}) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const response = await fetch(endpoint, { ...defaultOptions, ...options });
    
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

// Authentication utility functions
const Auth = {
  isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  getUser() {
    return Storage.get(STORAGE_KEYS.USER);
  },

  getHandyman() {
    return Storage.get(STORAGE_KEYS.HANDYMAN);
  },

  logout() {
    Storage.clear();
    window.location.href = './login-selection.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      localStorage.setItem(STORAGE_KEYS.REDIRECT_AFTER_LOGIN, window.location.href);
      window.location.href = './login.html';
      return false;
    }
    return true;
  }
};

// Alert utility functions
const Alert = {
  show(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 5000);
  },

  success(message) {
    this.show(message, 'success');
  },

  error(message) {
    this.show(message, 'error');
  },

  warning(message) {
    this.show(message, 'warning');
  }
};

// Validation utility functions
const Validation = {
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone) {
    return /^\d{7,}$/.test(phone);
  },

  isValidPassword(password) {
    return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
  },

  isValidRating(rating) {
    const num = parseInt(rating);
    return num >= VALIDATION.RATING_MIN && num <= VALIDATION.RATING_MAX;
  }
};

window.CONFIG = {
  API,
  Storage,
  Auth,
  Alert,
  Validation,
  ENDPOINTS,
  STORAGE_KEYS,
  VALIDATION
}; 