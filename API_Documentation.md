# 🚚 Courier Tracking API Documentation

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

## 🌐 Base URL

```
Development: http://localhost:5000
Production: https://your-domain.com
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. **Register a new user** or **Login** to get a JWT token
2. Use the token in subsequent requests

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "customer",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Parcels

#### Create Parcel (Customer)
```http
POST /api/v1/parcels
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "recipientName": "Alice Johnson",
  "recipientPhone": "+1234567890",
  "pickupAddress": "123 Main St, City, State 12345",
  "deliveryAddress": "456 Oak Ave, City, State 12345",
  "parcelSize": "medium",
  "parcelType": "package",
  "weight": 2.5,
  "paymentType": "cod",
  "codAmount": 25.00,
  "deliveryFee": 15.00,
  "isFragile": false,
  "requiresSignature": true,
  "specialInstructions": "Handle with care"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parcel created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "trackingId": "TRK123456789ABC",
    "recipientName": "Alice Johnson",
    "status": "pending",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "createdAt": "2024-08-03T19:00:00.000Z"
  }
}
```

#### Track Parcel (Public)
```http
GET /api/v1/parcels/track/TRK123456789ABC
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "trackingId": "TRK123456789ABC",
    "recipientName": "Alice Johnson",
    "status": "in_transit",
    "currentLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "456 Oak Ave, City, State 12345",
      "timestamp": "2024-08-03T19:30:00.000Z"
    },
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-08-03T19:00:00.000Z",
        "location": "123 Main St, City, State 12345",
        "notes": "Parcel booking created"
      },
      {
        "status": "picked_up",
        "timestamp": "2024-08-03T19:15:00.000Z",
        "location": "123 Main St, City, State 12345",
        "notes": "Parcel picked up from customer"
      },
      {
        "status": "in_transit",
        "timestamp": "2024-08-03T19:30:00.000Z",
        "location": "456 Oak Ave, City, State 12345",
        "notes": "Parcel in transit"
      }
    ]
  }
}
```

#### Get My Parcels (Customer)
```http
GET /api/v1/parcels/my-parcels?page=1&limit=10
Authorization: Bearer <customer-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "parcels": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "trackingId": "TRK123456789ABC",
        "recipientName": "Alice Johnson",
        "status": "in_transit",
        "deliveryAddress": "456 Oak Ave, City, State 12345",
        "createdAt": "2024-08-03T19:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Agents

#### Create Agent (Admin)
```http
POST /api/v1/agents
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "vehicleType": "car",
  "serviceAreas": ["Downtown", "Midtown", "Uptown"],
  "status": "available"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agent created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "vehicleType": "car",
    "status": "available",
    "serviceAreas": ["Downtown", "Midtown", "Uptown"],
    "rating": 0,
    "totalDeliveries": 0,
    "createdAt": "2024-08-03T19:00:00.000Z"
  }
}
```

#### Update Agent Location (Agent)
```http
PATCH /api/v1/agents/507f1f77bcf86cd799439013/location
Authorization: Bearer <agent-token>
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "123 Main St, City, State 12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "currentLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, City, State 12345",
      "timestamp": "2024-08-03T19:30:00.000Z"
    }
  }
}
```

### Payments

#### Create Payment (Customer)
```http
POST /api/v1/payments
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "parcelId": "507f1f77bcf86cd799439012",
  "amount": 25.00,
  "paymentType": "cod",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "parcelId": "507f1f77bcf86cd799439012",
    "amount": 25.00,
    "paymentType": "cod",
    "currency": "USD",
    "status": "pending",
    "createdAt": "2024-08-03T19:00:00.000Z"
  }
}
```

### Analytics

#### Dashboard Analytics (Admin)
```http
GET /api/v1/analytics/dashboard
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalParcels": 150,
    "todayParcels": 12,
    "totalRevenue": 2500.00,
    "todayRevenue": 180.00,
    "activeAgents": 8,
    "pendingDeliveries": 25,
    "completedDeliveries": 125,
    "failedDeliveries": 3,
    "recentActivity": [
      {
        "type": "parcel_created",
        "message": "New parcel created",
        "timestamp": "2024-08-03T19:00:00.000Z"
      },
      {
        "type": "parcel_delivered",
        "message": "Parcel delivered successfully",
        "timestamp": "2024-08-03T18:45:00.000Z"
      }
    ]
  }
}
```

## 📊 Request/Response Examples

### Pagination
Most list endpoints support pagination:

```http
GET /api/v1/parcels?page=1&limit=10&search=package&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term
- `sortBy`: Field to sort by
- `sortOrder`: Sort order (asc/desc)

### Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid token"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden",
  "error": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Not found",
  "error": "Parcel not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Something went wrong"
}
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

## ⚡ Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute
- **Admin endpoints**: 200 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔧 Environment Variables

For testing, you can use these environment variables:

```env
# Development
base_url=http://localhost:5000

# Production
base_url=https://your-domain.com

# JWT Tokens (get from login/register)
admin_token=your-admin-jwt-token
customer_token=your-customer-jwt-token
agent_token=your-agent-jwt-token
```

## 📝 Usage Examples

### Complete Flow Example

1. **Register a customer:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "customer"
  }'
```

2. **Create a parcel:**
```bash
curl -X POST http://localhost:5000/api/v1/parcels \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Alice Johnson",
    "recipientPhone": "+1234567890",
    "pickupAddress": "123 Main St, City, State 12345",
    "deliveryAddress": "456 Oak Ave, City, State 12345",
    "parcelSize": "medium",
    "parcelType": "package",
    "weight": 2.5,
    "paymentType": "cod",
    "codAmount": 25.00,
    "deliveryFee": 15.00
  }'
```

3. **Track the parcel:**
```bash
curl -X GET http://localhost:5000/api/v1/parcels/track/TRK123456789ABC
```

## 📚 Additional Resources

- **Swagger Documentation**: `http://localhost:5000/api/docs`
- **OpenAPI JSON**: `http://localhost:5000/api-json`
- **GitHub Repository**: https://github.com/mr7aali/courier-track-backend

---

**For support and questions, please refer to the README.md file or create an issue in the repository.** 