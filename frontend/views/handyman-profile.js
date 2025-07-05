class HandymanProfile {
  constructor() {
    this.handyman = null;
    this.handymanId = this.getHandymanIdFromUrl();
    this.init();
  }

  getHandymanIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const handymanId = urlParams.get('handymanId');
    
    if (!handymanId) {
      console.error('No handyman ID in URL parameters');
      return null;
    }
    
    // Basic validation for MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(handymanId)) {
      console.error('Invalid handyman ID format');
      return null;
    }
    
    return handymanId;
  }

  async init() {
    console.log('Initializing handyman profile page');
    if (!this.handymanId) {
      console.error('No handyman ID provided');
      this.showError('No handyman ID provided');
      return;
    }

    console.log('Handyman ID from URL:', this.handymanId);

    // Show loading state
    this.showLoading();

    try {
      await this.loadHandymanData();
      this.setupEventListeners();
      this.checkUserAuthentication();
      console.log('Handyman profile page initialized successfully');
    } catch (error) {
      console.error('Error initializing handyman profile:', error);
      this.showError('Failed to load handyman profile');
    }
  }

  async loadHandymanData() {
    console.log('Loading handyman data for ID:', this.handymanId);
    try {
      const response = await fetch(`${API_BASE_URL}/handymen/${this.handymanId}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to fetch handyman data: ${response.status}`);
      }
      
      this.handyman = await response.json();
      console.log('Handyman data loaded:', this.handyman);
      this.displayHandymanData();
    } catch (error) {
      console.error('Error loading handyman data:', error);
      this.showError('Failed to load handyman profile: ' + error.message);
    }
  }

  displayHandymanData() {
    console.log('Displaying handyman data:', this.handyman);
    
    // Restore the original HTML structure first
    const container = document.querySelector('.profile-container');
    if (container) {
      container.innerHTML = `
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-image">
              <img id="handymanImage" src="https://via.placeholder.com/140x140/f7931e/ffffff?text=Profile" alt="Handyman Profile">
            </div>
            <div class="profile-info">
              <h2 id="handymanName">Loading...</h2>
              <div class="rating">
                <div id="stars"></div>
                <span id="ratingText">0 reviews</span>
              </div>
              <p id="handymanProfession">Loading...</p>
              <p id="handymanLocation">Loading...</p>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-section">
              <h3>About</h3>
              <p id="handymanAbout">Loading...</p>
            </div>

            <div class="detail-section">
              <h3>Skills & Services</h3>
              <div id="handymanSkills" class="skills-list">
                <span class="loading">Loading...</span>
              </div>
            </div>

            <div class="detail-section">
              <h3>Experience</h3>
              <p id="handymanExperience">Loading...</p>
            </div>

            <div class="detail-section">
              <h3>Hourly Rate</h3>
              <p id="handymanRate">Loading...</p>
            </div>
          </div>

          <div class="action-buttons">
            <button id="bookNowBtn" class="btn btn-primary">
              <i class="fas fa-calendar-plus"></i> Book Now
            </button>
            <button id="viewReviewsBtn" class="btn btn-secondary">
              <i class="fas fa-star"></i> View Reviews
            </button>
          </div>
        </div>

        <div class="tab-content hidden" id="reviews">
          <div class="reviews-section">
            <h3>Customer Reviews</h3>
            
            <!-- Review Form for Customers -->
            <div class="review-form-container" id="reviewFormContainer" style="display: none;">
              <h4>Leave a Review</h4>
              <form id="reviewForm" class="review-form">
                <div class="rating-input">
                  <label>Your Rating:</label>
                  <div class="star-rating">
                    <input type="radio" name="rating" value="5" id="star5">
                    <label for="star5" class="star">★</label>
                    <input type="radio" name="rating" value="4" id="star4">
                    <label for="star4" class="star">★</label>
                    <input type="radio" name="rating" value="3" id="star3">
                    <label for="star3" class="star">★</label>
                    <input type="radio" name="rating" value="2" id="star2">
                    <label for="star2" class="star">★</label>
                    <input type="radio" name="rating" value="1" id="star1">
                    <label for="star1" class="star">★</label>
                  </div>
                </div>
                <div class="form-group">
                  <label for="reviewComment">Your Review:</label>
                  <textarea id="reviewComment" name="comment" rows="4" placeholder="Share your experience with this handyman..." required></textarea>
                </div>
                <button type="submit" class="submit-review-btn">Submit Review</button>
              </form>
            </div>
            
            <div id="reviewsList">
              <!-- Reviews will be loaded here -->
            </div>
          </div>
        </div>
      `;
    }
    
    // Display profile image
    const imageElement = document.getElementById('handymanImage');
    if (imageElement && this.handyman.profileImage) {
      imageElement.src = `${API_BASE_URL.replace('/api', '')}/${this.handyman.profileImage}`;
      console.log('Setting profile image:', imageElement.src);
    } else if (imageElement) {
      imageElement.src = 'https://via.placeholder.com/140x140/f7931e/ffffff?text=Profile';
      console.log('Using default profile image');
    }
    if (imageElement) {
      imageElement.alt = `${this.handyman.firstName} ${this.handyman.lastName}`;
    }

    // Display basic info
    const nameElement = document.getElementById('handymanName');
    const professionElement = document.getElementById('handymanProfession');
    const locationElement = document.getElementById('handymanLocation');
    const aboutElement = document.getElementById('handymanAbout');
    const experienceElement = document.getElementById('handymanExperience');
    const rateElement = document.getElementById('handymanRate');

    if (nameElement) nameElement.textContent = `${this.handyman.firstName} ${this.handyman.lastName}`;
    if (professionElement) professionElement.textContent = this.handyman.profession || 'General Handyman';
    if (locationElement) locationElement.textContent = this.handyman.location || 'Location not specified';
    if (aboutElement) aboutElement.textContent = this.handyman.bio || 'No bio available';
    if (experienceElement) experienceElement.textContent = `${this.handyman.experience || 0} years`;
    if (rateElement) rateElement.textContent = `GMD ${this.handyman.hourlyRate || 0}/hour`;

    console.log('Basic info displayed');

    // Display skills
    const skillsContainer = document.getElementById('handymanSkills');
    if (skillsContainer) {
      if (this.handyman.skills && this.handyman.skills.length > 0) {
        skillsContainer.innerHTML = this.handyman.skills.map(skill => 
          `<span class="skill-tag">${skill}</span>`
        ).join('');
        console.log('Skills displayed:', this.handyman.skills);
      } else {
        skillsContainer.innerHTML = '<span class="no-skills">No skills listed</span>';
        console.log('No skills to display');
      }
    }

    // Display rating
    this.displayRating(this.handyman.rating || 0, this.handyman.reviews?.length || 0);
    console.log('Rating displayed');

    // Load reviews
    this.loadReviews();

    // Set up booking button
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
      bookNowBtn.addEventListener('click', () => {
        localStorage.setItem('handyman', JSON.stringify(this.handyman));
        window.location.href = `booking.html?handymanId=${this.handyman._id}`;
      });
      console.log('Booking button set up');
    }
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

  setupEventListeners() {
    // View reviews button
    const viewReviewsBtn = document.getElementById('viewReviewsBtn');
    if (viewReviewsBtn) {
      viewReviewsBtn.addEventListener('click', () => {
        this.showReviewsTab();
      });
    }

    // Review form submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitReview();
      });
    }
  }

  checkUserAuthentication() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType'); // 'customer' or 'handyman'
    const reviewFormContainer = document.getElementById('reviewFormContainer');
    const reviewsSection = document.querySelector('#reviews .reviews-section');

    if (token && userType === 'customer') {
      // Customer is logged in, show review form
      if (reviewFormContainer) {
        reviewFormContainer.style.display = 'block';
      }
    } else if (token && userType === 'handyman') {
      // Handyman is logged in, show message that they can't review themselves
      if (reviewsSection) {
        const handymanPrompt = document.createElement('div');
        handymanPrompt.className = 'login-prompt';
        handymanPrompt.innerHTML = `
          <p>Handymen cannot review themselves. Please <a href="login-selection.html">log in as a customer</a> to leave a review.</p>
        `;
        reviewsSection.insertBefore(handymanPrompt, reviewsSection.firstChild);
      }
    } else {
      // User is not logged in, show login prompt
      if (reviewsSection) {
        const loginPrompt = document.createElement('div');
        loginPrompt.className = 'login-prompt';
        loginPrompt.innerHTML = `
          <p>Please <a href="login-selection.html">log in as a customer</a> to leave a review for this handyman.</p>
        `;
        reviewsSection.insertBefore(loginPrompt, reviewsSection.firstChild);
      }
    }
  }

  async submitReview() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token) {
      this.showReviewMessage('Please log in to leave a review', 'error');
      return;
    }
    
    if (userType !== 'customer') {
      this.showReviewMessage('Only customers can leave reviews. Please log in as a customer.', 'error');
      return;
    }

    const form = document.getElementById('reviewForm');
    const formData = new FormData(form);
    const rating = formData.get('rating');
    const comment = formData.get('comment');

    if (!rating || !comment.trim()) {
      this.showReviewMessage('Please provide both rating and comment', 'error');
      return;
    }

    if (comment.trim().length < 10) {
      this.showReviewMessage('Review comment must be at least 10 characters long', 'error');
      return;
    }

    const submitBtn = form.querySelector('.submit-review-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      console.log('Submitting review to:', `${API_BASE_URL}/customers/reviews`);
      console.log('Review data:', { rating, comment, handymanId: this.handymanId });
      
      const response = await fetch(`${API_BASE_URL}/customers/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: parseInt(rating),
          comment: comment.trim(),
          handymanId: this.handymanId
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        this.showReviewMessage('Review submitted successfully!', 'success');
        form.reset();
        
        // Reload handyman data to show updated rating
        await this.loadHandymanData();
        
        // Hide review form after successful submission
        setTimeout(() => {
          const reviewFormContainer = document.getElementById('reviewFormContainer');
          if (reviewFormContainer) {
            reviewFormContainer.style.display = 'none';
          }
        }, 2000);
      } else {
        this.showReviewMessage(data.message || 'Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      this.showReviewMessage('Network error. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  showReviewMessage(message, type) {
    const form = document.getElementById('reviewForm');
    const existingMessage = form.querySelector('.review-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `review-message ${type}`;
    messageDiv.textContent = message;
    form.insertBefore(messageDiv, form.firstChild);

    // Remove message after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  showReviewsTab() {
    const reviewsTab = document.getElementById('reviews');
    if (reviewsTab) {
      reviewsTab.classList.remove('hidden');
      // Scroll to reviews section
      reviewsTab.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async loadReviews() {
    if (!this.handyman.reviews || this.handyman.reviews.length === 0) {
      document.getElementById('reviewsList').innerHTML = '<p>No reviews yet</p>';
      return;
    }

    console.log('Loading reviews:', this.handyman.reviews);
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';

    for (let i = 0; i < this.handyman.reviews.length; i++) {
      const review = this.handyman.reviews[i];
      console.log(`Review ${i}:`, review);
      
      const reviewElement = document.createElement('div');
      reviewElement.className = 'review-item';
      
      const stars = this.generateStars(review.rating);
      
      // Get user name from populated data
      let userName = 'Anonymous';
      if (review.userId && review.userId.firstName && review.userId.lastName) {
        userName = `${review.userId.firstName} ${review.userId.lastName}`;
        console.log(`User name from userId: ${userName}`);
      } else if (review.user && review.user.firstName && review.user.lastName) {
        userName = `${review.user.firstName} ${review.user.lastName}`;
        console.log(`User name from user: ${userName}`);
      } else if (review.userId && typeof review.userId === 'string') {
        // If userId is just a string ID, try to fetch user data
        try {
          const userResponse = await fetch(`${API_BASE_URL}/users/${review.userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userName = `${userData.firstName} ${userData.lastName}`;
            console.log(`User name fetched from API: ${userName}`);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('No user data found for review:', review);
      }
      
      reviewElement.innerHTML = `
        <div class="review-header">
          <div class="review-stars">${stars}</div>
          <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
        <p class="review-comment">${review.comment}</p>
        <p class="review-user"><i class="fas fa-user"></i> ${userName}</p>
      `;
      
      reviewsList.appendChild(reviewElement);
    }
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

  showError(message) {
    const container = document.querySelector('.profile-container');
    if (container) {
      container.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 40px; background: white; border-radius: 20px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f7931e; margin-bottom: 20px;"></i>
          <h3 style="color: #333; margin-bottom: 15px;">Error</h3>
          <p style="color: #666; margin-bottom: 20px;">${message}</p>
          <a href="index.html" class="btn btn-primary" style="text-decoration: none; padding: 12px 24px; background: #f7931e; color: white; border-radius: 8px; border: none; cursor: pointer;">Go Back Home</a>
        </div>
      `;
    }
  }

  showLoading() {
    const container = document.querySelector('.profile-container');
    if (container) {
      container.innerHTML = `
        <div class="loading-message" style="text-align: center; padding: 40px; background: white; border-radius: 20px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);">
          <div class="loading-spinner" style="width: 50px; height: 50px; border: 4px solid #f0f0f0; border-top: 4px solid #f7931e; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
          <h3 style="color: #333; margin-bottom: 15px;">Loading Handyman Profile</h3>
          <p style="color: #666;">Please wait while we fetch the handyman information...</p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
    }
  }
}

// Initialize the handyman profile
document.addEventListener('DOMContentLoaded', () => {
  new HandymanProfile();
}); 