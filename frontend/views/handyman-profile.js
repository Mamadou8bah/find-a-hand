class HandymanProfile {
  constructor() {
    this.handymanId = this.getQueryParam('handymanId');
    this.handyman = null;
    this.init();
  }

  getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }

  async init() {
    if (!this.handymanId) {
      alert('No handyman specified');
      window.location.href = './index.html';
      return;
    }

    await this.loadHandymanDetails();
    this.attachEventListeners();
  }

  async loadHandymanDetails() {
    try {
      const response = await fetch(`${CONFIG.ENDPOINTS.HANDYMAN_BY_ID(this.handymanId)}`);
      if (!response.ok) throw new Error('Failed to fetch handyman details');

      this.handyman = await response.json();
      this.displayHandymanDetails();
    } catch (error) {
      console.error('Error loading handyman details:', error);
      alert('Failed to load handyman details');
    }
  }

  displayHandymanDetails() {
    if (!this.handyman) return;

    const imageElement = document.getElementById('handymanImage');
    if (this.handyman.profileImage) {
      imageElement.src = `http://localhost:5000/${this.handyman.profileImage}`;
    }

    document.getElementById('handymanName').textContent = `${this.handyman.firstName} ${this.handyman.lastName}`;
    document.getElementById('handymanProfession').textContent = this.handyman.profession || 'No profession specified';
    document.getElementById('handymanLocation').textContent = this.handyman.location || 'Location not specified';


    this.displayRating(this.handyman.rating || 0, this.handyman.reviews?.length || 0);

    document.getElementById('handymanAbout').textContent = 
      `Professional ${this.handyman.profession || 'handyman'} with expertise in various home services.`;

 
    this.displaySkills(this.handyman.skills || []);

    document.getElementById('handymanExperience').textContent = 
      `${this.handyman.experience || 0} years of experience`;

   
    document.getElementById('handymanRate').textContent = 
      this.handyman.hourlyRate ? `$${this.handyman.hourlyRate}/hour` : 'Rate not specified';
  }

  displayRating(rating, reviewCount) {
    const starsContainer = document.getElementById('stars');
    const ratingText = document.getElementById('ratingText');

   
    starsContainer.innerHTML = '';

  
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
      starsContainer.appendChild(star);
    }

    ratingText.textContent = `${reviewCount} review${reviewCount !== 1 ? 's' : ''}`;
  }

  displaySkills(skills) {
    const skillsContainer = document.getElementById('handymanSkills');
    skillsContainer.innerHTML = '';

    if (skills.length === 0) {
      skillsContainer.innerHTML = '<span>No skills specified</span>';
      return;
    }

    skills.forEach(skill => {
      const skillTag = document.createElement('span');
      skillTag.className = 'skill-tag';
      skillTag.textContent = skill;
      skillsContainer.appendChild(skillTag);
    });
  }

  attachEventListeners() {
    // Book Now button
    document.getElementById('bookNowBtn').addEventListener('click', () => {
      this.handleBookNow();
    });

   
    document.getElementById('viewReviewsBtn').addEventListener('click', () => {
      this.toggleReviews();
    });
  }

  handleBookNow() {
   
    if (this.handyman) {
      localStorage.setItem('handyman', JSON.stringify(this.handyman));
    }


    const token = localStorage.getItem('token');
    if (!token) {
      // Store current URL for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.href);
      alert('Please login to book this handyman');
              window.location.href = './login-selection.html';
      return;
    }

    // User is logged in, proceed to booking
    window.location.href = `./booking.html?handymanId=${this.handymanId}`;
  }

  toggleReviews() {
    const reviewsSection = document.getElementById('reviewsSection');
    const isVisible = reviewsSection.style.display !== 'none';

    if (!isVisible) {
      this.loadReviews();
      reviewsSection.style.display = 'block';
    } else {
      reviewsSection.style.display = 'none';
    }
  }

  async loadReviews() {
    if (!this.handyman.reviews || this.handyman.reviews.length === 0) {
      document.getElementById('reviewsList').innerHTML = '<p>No reviews yet</p>';
      return;
    }

    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';

    this.handyman.reviews.forEach(review => {
      const reviewElement = document.createElement('div');
      reviewElement.className = 'review-item';
      
      const stars = this.generateStars(review.rating);
      
      reviewElement.innerHTML = `
        <div class="review-header">
          <div class="review-stars">${stars}</div>
          <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
        <p class="review-comment">${review.comment}</p>
      `;
      
      reviewsList.appendChild(reviewElement);
    });
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
}


document.addEventListener('DOMContentLoaded', () => {
  new HandymanProfile();
}); 