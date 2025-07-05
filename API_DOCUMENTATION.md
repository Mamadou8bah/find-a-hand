# Find-A-Hand API Documentation

## Overview
Find-A-Hand is a handyman service booking platform that connects customers with skilled handymen. This API provides endpoints for user registration, handyman management, booking services, and reviews.

## Base URL
- Development: `http://localhost:5000`
- Production: `https://web-production-f6074.up.railway.app`

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Responses
All error responses follow this format:
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "invalid value"
    }
  ]
}
```

## Endpoints

### Authentication

#### Register Handyman
- **POST** `/api/handymen/register`
- **Description**: Register a new handyman account
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York",
    "password": "password123",
    "profession": "Plumber",
    "skills": ["Plumbing", "Repairs"],
    "experience": 5,
    "hourlyRate": 50
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt-token-here",
    "message": "Registration successful"
  }
  ```

#### Login Handyman
- **POST** `/api/handymen/login`
- **Description**: Login as a handyman
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt-token-here",
    "message": "Login successful"
  }
  ```

### Handyman Management

#### Get All Handymen
- **GET** `/api/handymen`
- **Description**: Get all available handymen
- **Query Parameters**:
  - `location` (optional): Filter by location
  - `profession` (optional): Filter by profession
  - `rating` (optional): Filter by minimum rating
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of results per page
- **Response**:
  ```json
  {
    "handymen": [
      {
        "_id": "handyman-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "location": "New York",
        "profession": "Plumber",
        "skills": ["Plumbing", "Repairs"],
        "experience": 5,
        "hourlyRate": 50,
        "rating": 4.5,
        "totalReviews": 10,
        "isAvailable": true,
        "profileImage": "uploads/profileImages/image.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalHandymen": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
  ```

#### Get Handyman Profile
- **GET** `/api/handymen/me`
- **Description**: Get current handyman's profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "_id": "handyman-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York",
    "profession": "Plumber",
    "skills": ["Plumbing", "Repairs"],
    "experience": 5,
    "hourlyRate": 50,
    "rating": 4.5,
    "totalReviews": 10,
    "reviews": [
      {
        "userId": "user-id",
        "rating": 5,
        "comment": "Great service!",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user": {
          "firstName": "Jane",
          "lastName": "Smith"
        }
      }
    ],
    "pendingRequests": 2,
    "monthlyEarnings": 2500,
    "confirmedBookings": 15,
    "completedBookings": 12
  }
  ```

#### Update Handyman Profile
- **PUT** `/api/handymen/me`
- **Description**: Update handyman profile
- **Headers**: `Authorization: Bearer <token>`
- **Body** (multipart/form-data):
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "location": "New York",
    "profession": "Plumber",
    "skills": ["Plumbing", "Repairs"],
    "experience": 5,
    "hourlyRate": 50,
    "profileImage": "file"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Profile updated successfully",
    "handyman": {
      "_id": "handyman-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "location": "New York",
      "profession": "Plumber",
      "skills": ["Plumbing", "Repairs"],
      "experience": 5,
      "hourlyRate": 50,
      "profileImage": "uploads/profileImages/new-image.jpg"
    }
  }
  ```

#### Update Password
- **PUT** `/api/handymen/me/password`
- **Description**: Update handyman password
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

### Booking Management

#### Create Booking
- **POST** `/api/bookings`
- **Description**: Create a new booking
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "handymanId": "handyman-id",
    "service": "Plumbing Repair",
    "taskDescription": "Fix leaking faucet in kitchen",
    "date": "2024-01-15T10:00:00.000Z",
    "time": "10:00",
    "phone": "+1234567890",
    "location": "123 Main St, New York",
    "estimatedDuration": 2,
    "estimatedCost": 100
  }
  ```
- **Response**:
  ```json
  {
    "message": "Booking created successfully",
    "booking": {
      "_id": "booking-id",
      "user": "user-id",
      "handymanId": "handyman-id",
      "service": "Plumbing Repair",
      "taskDescription": "Fix leaking faucet in kitchen",
      "date": "2024-01-15T10:00:00.000Z",
      "time": "10:00",
      "phone": "+1234567890",
      "location": "123 Main St, New York",
      "status": "Pending",
      "estimatedDuration": 2,
      "estimatedCost": 100,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### Get Handyman Bookings
- **GET** `/api/handymen/me/bookings`
- **Description**: Get current handyman's bookings
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status` (optional): Filter by status (Pending, Confirmed, Completed, Cancelled)
  - `page` (optional): Page number
  - `limit` (optional): Number of results per page
- **Response**:
  ```json
  {
    "bookings": [
      {
        "_id": "booking-id",
        "user": {
          "_id": "user-id",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com",
          "phone": "+1234567890"
        },
        "service": "Plumbing Repair",
        "taskDescription": "Fix leaking faucet in kitchen",
        "date": "2024-01-15T10:00:00.000Z",
        "time": "10:00",
        "phone": "+1234567890",
        "location": "123 Main St, New York",
        "status": "Pending",
        "estimatedDuration": 2,
        "estimatedCost": 100,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalBookings": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
  ```

#### Update Booking Status
- **PUT** `/api/handymen/me/bookings/:id/status`
- **Description**: Update booking status
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "Confirmed"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Booking status updated successfully",
    "booking": {
      "_id": "booking-id",
      "status": "Confirmed",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Reviews

#### Add Review
- **POST** `/api/handymen/reviews`
- **Description**: Add a review to a handyman
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "handymanId": "handyman-id",
    "rating": 5,
    "comment": "Excellent service! Very professional and completed the work on time."
  }
  ```
- **Response**:
  ```json
  {
    "message": "Review added successfully",
    "review": {
      "_id": "review-id",
      "userId": "user-id",
      "handymanId": "handyman-id",
      "rating": 5,
      "comment": "Excellent service! Very professional and completed the work on time.",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Health & Testing

#### Health Check
- **GET** `/health`
- **Description**: Check API health status
- **Response**:
  ```json
  {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "environment": "production",
    "uptime": 3600,
    "memory": {
      "rss": 12345678,
      "heapTotal": 9876543,
      "heapUsed": 5432109,
      "external": 1234567
    },
    "database": "connected"
  }
  ```

#### Test Endpoint
- **GET** `/test`
- **Description**: Test API functionality
- **Response**:
  ```json
  {
    "message": "Find-A-Hand API is working!",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
  ```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- Login attempts: 5 per 15 minutes
- Registration: 3 per hour
- General API: 100 requests per 15 minutes

## File Upload

- Supported formats: JPEG, PNG, GIF
- Maximum file size: 5MB
- Upload path: `/uploads/profileImages/`

## Environment Variables

Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)

## Support

For API support and questions, please contact the development team. 