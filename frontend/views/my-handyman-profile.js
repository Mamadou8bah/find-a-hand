// === Tab Switch Helper ===
function switchTab(tabId) {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => tab.classList.remove("active"));
    contents.forEach(content => content.classList.add("hidden"));

    document.getElementById(tabId).classList.remove("hidden");
    document.querySelector(`.tab[onclick="switchTab('${tabId}')"]`).classList.add("active");
}

// === DOM Logic ===
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const saveBtn = document.getElementById("save-btn");

    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const job = document.getElementById("job");
    const location = document.getElementById("location");

    const fields = [name, phone, email, job, location];

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.classList.add("opacity-50", "cursor-not-allowed");
    }

    function validateField() {
        let isValid = true;

        if (name.value.trim() === "") isValid = false;
        if (!/^\d{6,15}$/.test(phone.value.trim())) isValid = false;
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) isValid = false;
        if (job.value === "select") isValid = false;
        if (location.value.trim() === "") isValid = false;

        if (saveBtn) {
            saveBtn.disabled = !isValid;
            if (isValid) {
                saveBtn.classList.remove("opacity-50", "cursor-not-allowed");
            } else {
                saveBtn.classList.add("opacity-50", "cursor-not-allowed");
            }
        }
    }

    fields.forEach(field => {
        field.addEventListener("input", validateField);
        field.addEventListener("change", validateField);
    });

    if (form && saveBtn) {
        saveBtn.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelectorAll(".error").forEach(err => err.textContent = "");
            let hasError = false;

            if (name.value.trim() === "") {
                document.getElementById("nameError").textContent = "Name is required";
                hasError = true;
            }

            if (!/^\d{6,15}$/.test(phone.value.trim())) {
                document.getElementById("phoneError").textContent = "Enter a valid phone number";
                hasError = true;
            }

            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
                document.getElementById("emailError").textContent = "Enter a valid email";
                hasError = true;
            }

            if (job.value === "select") {
                document.getElementById("jobError").textContent = "Please select a job";
                hasError = true;
            }

            if (location.value.trim() === "") {
                document.getElementById("locationError").textContent = "Location is required";
                hasError = true;
            }

            if (!hasError) {
                alert("Profile updated successfully!");
            }
        });
    }

    document.querySelectorAll(".delete-button").forEach(button => {
        button.addEventListener("click", function () {
            const confirmed = confirm("Are you sure you want to delete this appointment?");
            if (confirmed) {
                const appointment = this.closest(".appointment");
                if (appointment) {
                    appointment.remove();
                }
            }
        });
    });
});

// Enhanced My Handyman Profile JavaScript
class MyHandymanProfile {
    constructor() {
        this.handymanId = null;
        this.handyman = null;
        this.appointments = [];
        this.reviews = [];
        this.init();
    }

    async init() {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            this.showNotification('Please login to access your profile', 'error');
            window.location.href = './login-selection.html';
            return;
        }

        await this.loadHandymanProfile();
        this.attachEventListeners();
        this.loadAppointments();
        this.loadReviews();
    }

    async loadHandymanProfile() {
        try {
            console.log('Loading handyman profile...');
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.log('No token found in localStorage');
                this.showNotification('Please login to access your profile', 'error');
                window.location.href = './login-selection.html';
                return;
            }
            
            console.log('Token found:', token.substring(0, 20) + '...');
            
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/handymen/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Token expired or invalid');
                    localStorage.removeItem('token');
                    this.showNotification('Session expired. Please login again.', 'error');
                    window.location.href = './login-selection.html';
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.handyman = await response.json();
            console.log('Handyman profile loaded:', this.handyman);
            this.handymanId = this.handyman._id;
            this.displayProfile();
            
            // Load reviews from profile data
            this.reviews = this.handyman.reviews || [];
            console.log('Reviews loaded:', this.reviews);
            this.displayReviews();
            this.updateReviewStats();
        } catch (error) {
            console.error('Error loading handyman profile:', error);
            this.showNotification('Failed to load profile: ' + error.message, 'error');
        }
    }

    displayProfile() {
        if (!this.handyman) return;

        // Update profile image
        const profileImage = document.getElementById('profileImage');
        if (this.handyman.profileImage) {
            profileImage.src = `http://localhost:5000/${this.handyman.profileImage}`;
        }

        // Update profile info
        document.getElementById('profileName').textContent = `${this.handyman.firstName} ${this.handyman.lastName}`;
        document.getElementById('profileJob').textContent = this.handyman.profession || 'No profession specified';

        // Update form fields
        document.getElementById('name').value = `${this.handyman.firstName} ${this.handyman.lastName}`;
        document.getElementById('phone').value = this.handyman.phone || '';
        document.getElementById('email').value = this.handyman.email || '';
        document.getElementById('job').value = this.handyman.profession || 'select';
        document.getElementById('location').value = this.handyman.location || '';
        document.getElementById('bio').value = this.handyman.bio || '';
        document.getElementById('hourlyRate').value = this.handyman.hourlyRate || 25;

        // Update rating
        this.displayRating(this.handyman.rating || 0, this.handyman.reviews?.length || 0);
        
        // Update About section
        this.displayAbout();
        
        // Update Portfolio section
        this.displayPortfolio();
    }

    displayAbout() {
        if (!this.handyman) return;

        // Update Bio
        const bioElement = document.getElementById('handymanBio');
        if (bioElement) {
            bioElement.textContent = this.handyman.bio || 'No bio available';
        }

        // Update Skills
        const skillsElement = document.getElementById('handymanSkills');
        if (skillsElement) {
            if (this.handyman.skills && this.handyman.skills.length > 0) {
                skillsElement.innerHTML = this.handyman.skills.map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                ).join('');
            } else {
                skillsElement.innerHTML = '<p class="no-data">No skills listed</p>';
            }
        }

        // Update Experience
        const experienceElement = document.getElementById('handymanExperience');
        if (experienceElement) {
            const experience = this.handyman.experience || 0;
            experienceElement.textContent = `${experience} year${experience !== 1 ? 's' : ''} of experience`;
        }

        // Update Hourly Rate
        const rateElement = document.getElementById('handymanRate');
        if (rateElement) {
            const rate = this.handyman.hourlyRate || 0;
            rateElement.textContent = rate > 0 ? `GMD ${rate}/hour` : 'Rate not specified';
        }

        // Update Location
        const locationElement = document.getElementById('handymanLocation');
        if (locationElement) {
            locationElement.textContent = this.handyman.location || 'Location not specified';
        }
    }

    displayPortfolio() {
        const portfolioGrid = document.getElementById('portfolioGrid');
        const noPortfolio = document.getElementById('noPortfolio');
        
        if (!portfolioGrid) return;

        if (!this.handyman.portfolioImages || this.handyman.portfolioImages.length === 0) {
            portfolioGrid.style.display = 'none';
            if (noPortfolio) {
                noPortfolio.style.display = 'block';
            }
            return;
        }

        portfolioGrid.style.display = 'grid';
        if (noPortfolio) {
            noPortfolio.style.display = 'none';
        }

        portfolioGrid.innerHTML = '';
        
        this.handyman.portfolioImages.forEach((imageUrl, index) => {
            const portfolioItem = document.createElement('div');
            portfolioItem.className = 'portfolio-item';
            portfolioItem.innerHTML = `
                <img src="http://localhost:5000/${imageUrl}" alt="Portfolio work ${index + 1}" class="portfolio-image">
                <div class="portfolio-overlay">
                    <i class="fas fa-eye"></i>
                </div>
            `;
            portfolioGrid.appendChild(portfolioItem);
        });
    }

    displayRating(rating, reviewCount) {
        const ratingContainer = document.getElementById('profileRating');
        ratingContainer.innerHTML = '';

        // Generate stars
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            if (rating >= i) {
                star.className = 'fas fa-star';
                star.style.color = 'orange';
            } else if (rating >= i - 0.5) {
                star.className = 'fas fa-star-half-alt';
                star.style.color = 'orange';
            } else {
                star.className = 'far fa-star';
                star.style.color = 'orange';
            }
            ratingContainer.appendChild(star);
        }

        // Add rating text
        const ratingText = document.createElement('span');
        ratingText.textContent = rating.toFixed(1);
        ratingContainer.appendChild(ratingText);
    }

    async loadAppointments() {
        try {
            console.log('Loading appointments...');
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.log('No token found for appointments');
                return;
            }
            
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/handymen/me/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Appointments response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Token expired for appointments');
                    localStorage.removeItem('token');
                    this.showNotification('Session expired. Please login again.', 'error');
                    window.location.href = './login-selection.html';
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.appointments = await response.json();
            console.log('Appointments loaded:', this.appointments);
            this.displayAppointments();
            this.updateAppointmentStats();
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.showNotification('Failed to load appointments: ' + error.message, 'error');
        }
    }

    displayAppointments() {
        const appointmentsList = document.getElementById('appointmentsList');
        appointmentsList.innerHTML = '';

        if (this.appointments.length === 0) {
            appointmentsList.innerHTML = '<p class="no-data">No appointments found</p>';
            return;
        }

        this.appointments.forEach(appointment => {
            const appointmentElement = this.createAppointmentElement(appointment);
            appointmentsList.appendChild(appointmentElement);
        });
    }

    createAppointmentElement(appointment) {
        const div = document.createElement('div');
        div.className = 'appointment';
        div.setAttribute('data-id', appointment._id);

        const statusClass = appointment.status.toLowerCase();
        const statusIcon = this.getStatusIcon(appointment.status);
        const statusText = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);

        div.innerHTML = `
            <div class="appointment-info">
                <p class="appointment-date">${new Date(appointment.date).toLocaleDateString()}</p>
                <p class="appointment-description">${appointment.service}</p>
                <span>
                    <p class="appointment-time">${appointment.time}</p>
                    <p class="client-name">${appointment.user ? `${appointment.user.firstName} ${appointment.user.lastName}` : 'Unknown Client'}</p>
                </span>
                <div class="appointment-status ${statusClass}">
                    <i class="${statusIcon}"></i> ${statusText}
                </div>
            </div>
            <button class="delete-button" onclick="myProfile.deleteAppointment('${appointment._id}')">
                <i class="fa fa-trash"></i>
            </button>
        `;

        return div;
    }

    getStatusIcon(status) {
        const statusMap = {
            'pending': 'fas fa-clock',
            'confirmed': 'fas fa-check',
            'completed': 'fas fa-check-circle',
            'cancelled': 'fas fa-times-circle'
        };
        return statusMap[status.toLowerCase()] || 'fas fa-clock';
    }

    updateAppointmentStats() {
        const pendingCount = this.appointments.filter(a => a.status === 'pending').length;
        const completedCount = this.appointments.filter(a => a.status === 'completed').length;

        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('completedCount').textContent = completedCount;
    }

    loadReviews() {
        // Use reviews from the handyman profile data instead of fetching separately
        this.reviews = this.handyman.reviews || [];
        this.displayReviews();
        this.updateReviewStats();
    }

    displayReviews() {
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = '';

        if (this.reviews.length === 0) {
            reviewsList.innerHTML = '<p class="no-data">No reviews yet</p>';
            return;
        }

        this.reviews.forEach(review => {
            const reviewElement = this.createReviewElement(review);
            reviewsList.appendChild(reviewElement);
        });
    }

    createReviewElement(review) {
        const div = document.createElement('div');
        div.className = 'review';

        const stars = this.generateStars(review.rating);

        div.innerHTML = `
            <div class="review-header">
                <span class="rating">${stars}<span>${review.rating}</span></span>
                <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <p class="rating-description">${review.comment}</p>
            <p class="rating-user">${review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous'}</p>
        `;

        return div;
    }

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
    }

    updateReviewStats() {
        if (this.reviews.length === 0) {
            document.getElementById('averageRating').textContent = '0.0';
            document.getElementById('totalReviews').textContent = '0';
            return;
        }

        const averageRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
        document.getElementById('averageRating').textContent = averageRating.toFixed(1);
        document.getElementById('totalReviews').textContent = this.reviews.length;
    }

    async deleteAppointment(appointmentId) {
        const confirmed = confirm('Are you sure you want to delete this appointment?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/handymen/me/bookings/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete appointment');
            }

            this.showNotification('Appointment deleted successfully');
            await this.loadAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            this.showNotification('Failed to delete appointment', 'error');
        }
    }

    async saveProfile() {
        const formData = {
            firstName: document.getElementById('name').value.split(' ')[0],
            lastName: document.getElementById('name').value.split(' ').slice(1).join(' '),
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            profession: document.getElementById('job').value,
            location: document.getElementById('location').value,
            bio: document.getElementById('bio').value,
            hourlyRate: parseInt(document.getElementById('hourlyRate').value)
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/handymen/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            this.showNotification('Profile updated successfully');
            await this.loadHandymanProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Failed to update profile', 'error');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notificationMessage');
        
        messageElement.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    attachEventListeners() {
        // Form validation and submission
        const form = document.getElementById('profileForm');
        const saveBtn = document.getElementById('save-btn');
        const fields = ['name', 'phone', 'email', 'job', 'location', 'hourlyRate'];

        // Real-time validation
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.validateForm());
                field.addEventListener('blur', () => this.validateField(fieldId));
            }
        });

        // Form submission
        if (form && saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.validateForm()) {
                    this.saveProfile();
                }
            });
        }

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = tab.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.switchTab(tabId);
            });
        });
    }

    validateForm() {
        const fields = ['name', 'phone', 'email', 'job', 'location', 'hourlyRate'];
        let isValid = true;

        fields.forEach(fieldId => {
            if (!this.validateField(fieldId)) {
                isValid = false;
            }
        });

        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.disabled = !isValid;
            saveBtn.classList.toggle('opacity-50', !isValid);
            saveBtn.classList.toggle('cursor-not-allowed', !isValid);
        }

        return isValid;
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        let isValid = true;
        let errorMessage = '';

        if (!field) return true;

        const value = field.value.trim();

        switch (fieldId) {
            case 'name':
                if (value === '') {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.split(' ').length < 2) {
                    errorMessage = 'Please enter full name (first and last name)';
                    isValid = false;
                }
                break;

            case 'phone':
                if (value === '') {
                    errorMessage = 'Phone is required';
                    isValid = false;
                } else if (!/^\d{6,15}$/.test(value)) {
                    errorMessage = 'Enter a valid phone number';
                    isValid = false;
                }
                break;

            case 'email':
                if (value === '') {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
                    errorMessage = 'Enter a valid email';
                    isValid = false;
                }
                break;

            case 'job':
                if (value === 'select') {
                    errorMessage = 'Please select a job type';
                    isValid = false;
                }
                break;

            case 'location':
                if (value === '') {
                    errorMessage = 'Location is required';
                    isValid = false;
                }
                break;

            case 'hourlyRate':
                const rate = parseInt(value);
                if (isNaN(rate) || rate < 10 || rate > 1000) {
                    errorMessage = 'Hourly rate must be between GMD 10 and GMD 1000';
                    isValid = false;
                }
                break;
        }

        // Update error display
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = errorMessage ? 'block' : 'none';
        }

        // Update field styling
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error', 'success');
            if (errorMessage) {
                formGroup.classList.add('error');
            } else if (value !== '') {
                formGroup.classList.add('success');
            }
        }

        return isValid;
    }

    switchTab(tabId) {
        const tabs = document.querySelectorAll('.tab');
        const contents = document.querySelectorAll('.tab-content');

        // Remove active class from all tabs
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Hide all content
        contents.forEach(content => content.classList.add('hidden'));

        // Show selected content
        const selectedContent = document.getElementById(tabId);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }

        // Add active class to selected tab
        const selectedTab = document.querySelector(`[onclick*="${tabId}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Load data for the selected tab
        if (tabId === 'appointments') {
            this.loadAppointments();
        } else if (tabId === 'reviews') {
            this.loadReviews();
        } else if (tabId === 'about') {
            this.displayAbout();
        } else if (tabId === 'portfolio') {
            this.displayPortfolio();
        }
    }
}

// Global instance
let myProfile;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    myProfile = new MyHandymanProfile();
});

// Global functions for backward compatibility
function switchTab(tabId) {
    if (myProfile) {
        myProfile.switchTab(tabId);
    }
}

function deleteAppointment(appointmentId) {
    if (myProfile) {
        myProfile.deleteAppointment(appointmentId);
    }
}
