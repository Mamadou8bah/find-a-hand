# Find-A-Hand 🛠️

A comprehensive handyman service booking platform that connects customers with skilled professionals for various home services.

## 🌟 Live at
https://findahand.netlify.app/

## 🌟 Features

### For Customers
- **Search & Discover**: Find handymen by service type and location
- **Profile Viewing**: Detailed handyman profiles with reviews and ratings
- **Booking System**: Easy booking with date/time selection
- **Review System**: Rate and review handymen after service
- **Dashboard**: Track booking history and manage appointments
- **Real-time Updates**: Live booking status updates

### For Handymen
- **Profile Management**: Complete profile with skills, experience, and portfolio
- **Booking Management**: Accept, reject, or complete bookings
- **Earnings Tracking**: Monitor income and completed jobs
- **Review Management**: View and respond to customer reviews
- **Schedule Management**: Track upcoming appointments

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Data**: Dynamic updates without page refresh
- **Secure Authentication**: JWT-based user authentication
- **File Upload**: Profile image upload functionality
- **Search & Filter**: Advanced search with multiple criteria

##  Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd find-a-hand
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/find-a-hand
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Backend API: `http://localhost:5000`
   - Frontend: Open `frontend/views/index.html` in your browser

## 📁 Project Structure

```
find-a-hand/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── controllers/
│   │   ├── handymanController.js
│   │   ├── userController.js
│   │   └── bookingController.js
│   ├── middlewares/
│   │   ├── handymanAuthMiddleware.js
│   │   ├── userAuthMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── HandymanModel.js
│   │   ├── userModel.js
│   │   └── bookingModel.js
│   └── routes/
│       ├── handymanRoutes.js
│       ├── userRoutes.js
│       ├── bookingRoutes.js
│       └── customerRoutes.js
├── frontend/
│   ├── views/
│   │   ├── index.html          # Homepage
│   │   ├── search-handyman.html
│   │   ├── handyman-profile.html
│   │   ├── customer-dashboard.html
│   │   ├── handyman-dashboard.html
│   │   ├── login-selection.html
│   │   └── ... (other pages)
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── uploads/                # Profile images
├── app.js                      # Express app setup
├── server.js                   # Server entry point
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/handymen/register` - Register handyman
- `POST /api/handymen/login` - Login handyman
- `POST /api/users/register` - Register customer
- `POST /api/users/login` - Login customer

### Handymen
- `GET /api/handymen` - Get all handymen
- `GET /api/handymen/:id` - Get handyman by ID
- `GET /api/handymen/me` - Get current handyman profile
- `PUT /api/handymen/me` - Update handyman profile

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Reviews
- `POST /api/handymen/reviews` - Add review to handyman
- `GET /api/handymen/:id` - Get handyman with reviews

## 🎨 Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File uploads
- **express-validator** - Input validation

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with animations
- **JavaScript (ES6+)** - Interactivity
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- File upload security
- Error handling and logging

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please contact the development team.

---

**Find-A-Hand** - Connecting skilled professionals with customers who need quality home services! 
