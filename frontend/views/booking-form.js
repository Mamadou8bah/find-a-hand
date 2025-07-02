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
    this.attachListeners();
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
      if (this.validateForm()) {
        await this.submitForm();
      }
    });
  }

  updateCharCount() {
    const task = this.fields.task.value.length;
    this.charCounter.textContent = `${task} / 200`;
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
    if (!token) {
      alert('Please log in to book a handyman');
      window.location.href = './login.html';
      return;
    }

    const service = this.fields.service.value;
    const taskDescription = this.fields.task.value.trim();
    const date = this.fields.date.value;
    const time = this.fields.time.value;
    const phone = this.fields.phone.value.trim();
    const location = this.fields.location.value.trim();

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ service, taskDescription, date, time, phone, location })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Booking created successfully!');
        this.form.reset();
        this.updateCharCount();
        this.toggleSubmit();
      } else {
        alert(data.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting booking');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => new FormValidator());
