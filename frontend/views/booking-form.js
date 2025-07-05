window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
  
    const handyman = JSON.parse(localStorage.getItem('handyman') || '{}');
    localStorage.setItem('redirectAfterLogin', window.location.href);
    if (handyman._id) {
      localStorage.setItem('pendingHandyman', JSON.stringify(handyman));
    }
    window.location.href = './login-selection.html';
    return;
  }
  new FormValidator();
});


class FormValidator {
  constructor() {
    this.form = document.getElementById('booking-form');
    this.fields = {
      task: document.getElementById('task'),
      date: document.getElementById('date'),
      time: document.getElementById('time'),
      phone: document.getElementById('phone'),
      service: document.getElementById('service'),
      location: document.getElementById('location')
    };
    this.errors = {
      task: document.getElementById('taskError'),
      date: document.getElementById('dateError'),
      time: document.getElementById('timeError'),
      phone: document.getElementById('phoneError'),
      service: document.getElementById('serviceError'),
      location: document.getElementById('locationError')
    };
    this.charCounter = document.getElementById('taskCounter');
    this.submitButton = document.getElementById('btn');

    this.handymanId = this.getQueryParam('handymanId');
    this.userInfo = null;

    this.init();
  }

  async init() {
    
    const handyman = JSON.parse(localStorage.getItem('handyman') || '{}');
    if (!handyman._id && !this.handymanId) {
      alert('No handyman specified for booking.');
      this.submitButton.disabled = true;
      return;
    }

    
    if (!this.handymanId && handyman._id) {
      this.handymanId = handyman._id;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      const currentUrl = window.location.href;
      localStorage.setItem('redirectAfterLogin', currentUrl);
      if (handyman._id) {
        localStorage.setItem('pendingHandyman', JSON.stringify(handyman));
      }
      window.location.href = './login-selection.html';
      return;
    }

    await this.loadUserInfo();

    if (!this.userInfo) {
      alert('Could not load user info. Please login again.');
      localStorage.removeItem('token');
      localStorage.setItem('redirectAfterLogin', window.location.href);
      if (handyman._id) {
        localStorage.setItem('pendingHandyman', JSON.stringify(handyman));
      }
      window.location.href = './login-selection.html';
      return;
    }

   
    if (this.userInfo.phone) {
      this.fields.phone.value = this.userInfo.phone;
    }

    this.attachListeners();
    this.updateCharCount();
    this.toggleSubmit();
  }

  getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }

  async loadUserInfo() {
    const userJson = localStorage.getItem('user');
    
    if (userJson) {
      try {
        this.userInfo = JSON.parse(userJson);
        return;
      } catch (e) {
        console.error('Invalid JSON found in localStorage for "user":', userJson);
        localStorage.removeItem('user');
      }
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch user info');

      const userData = await response.json(); 
      this.userInfo = userData;
      localStorage.setItem('user', JSON.stringify(userData)); 
    } catch (error) {
      console.error('Error loading user info:', error);
      this.userInfo = null;
    }
  }

  attachListeners() {
    Object.keys(this.fields).forEach(key => {
      const field = this.fields[key];
      field.addEventListener('input', () => {
        this.validateField(key);
        this.toggleSubmit();

        if (key === 'task') {
          this.updateCharCount();
        }
      });
    });

    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('token');
      if (!token) {
        const currentUrl = window.location.href;
        localStorage.setItem('redirectAfterLogin', currentUrl);
        const handyman = JSON.parse(localStorage.getItem('handyman') || '{}');
        if (handyman._id) {
          localStorage.setItem('pendingHandyman', JSON.stringify(handyman));
        }
        alert('Please login to make a booking.');
        window.location.href = './login.html';
        return;
      }

      if (this.validateForm()) {
        await this.submitForm();
      }
    });
  }

  updateCharCount() {
    const taskLength = this.fields.task.value.length;
    this.charCounter.textContent = `${taskLength} / 200`;
  }

  validateField(key) {
    const field = this.fields[key];
    const error = this.errors[key];
    let valid = true;
    let message = '';

    switch (key) {
      case 'task':
        const taskText = field.value.trim();
        valid = taskText !== '' && taskText.length <= 200;
        if (!valid) message = 'Task is required and must be under 200 characters';
        break;

      case 'date':
        valid = field.value.trim() !== '';
        if (!valid) message = 'Date is required';
        break;

      case 'time':
        valid = field.value.trim() !== '';
        if (!valid) message = 'Time is required';
        break;

      case 'phone':
        valid = /^[0-9]{7}$/.test(field.value.trim());
        if (!valid) message = 'Phone must be exactly 7 digits';
        break;

      case 'service':
        valid = field.value.trim() !== '';
        if (!valid) message = 'Please select a service';
        break;

      case 'location':
        valid = field.value.trim() !== '';
        if (!valid) message = 'Location is required';
        break;
    }

    if (!valid) {
      field.classList.add('invalid');
      field.classList.remove('valid');
      if (error) error.textContent = message;
    } else {
      field.classList.remove('invalid');
      field.classList.add('valid');
      if (error) error.textContent = '';
    }

    return valid;
  }

  validateForm() {
    return Object.keys(this.fields).every(key => this.validateField(key));
  }

  toggleSubmit() {
    this.submitButton.disabled = !this.validateForm();
  }

  async submitForm() {
    const token = localStorage.getItem('token');

    const bookingPayload = {
      handymanId: this.handymanId,
      service: this.fields.service.value,
      taskDescription: this.fields.task.value.trim(),
      date: this.fields.date.value,
      time: this.fields.time.value,
      phone: this.fields.phone.value.trim(),
      location: this.fields.location.value.trim()
    };

    try {
      this.submitButton.textContent = 'Booking...';
      this.submitButton.disabled = true;

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Booking created successfully!');
        this.form.reset();
        this.updateCharCount();
        this.toggleSubmit();
        
        localStorage.removeItem('handyman');
        localStorage.removeItem('pendingHandyman');
       
        window.location.href = './index.html';
      } else {
        alert(data.message || 'Failed to create booking');
        this.submitButton.textContent = 'Book Now';
        this.submitButton.disabled = false;
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting booking');
      this.submitButton.textContent = 'Book Now';
      this.submitButton.disabled = false;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => new FormValidator());
