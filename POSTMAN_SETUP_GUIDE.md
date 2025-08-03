# 🚀 Postman Setup Guide for Courier Tracking API

## 📦 Files Included

1. **`Courier_Tracking_API.postman_collection.json`** - Main API collection
2. **`Courier_Tracking_API.postman_environment.json`** - Environment variables
3. **`API_Documentation.md`** - Detailed API documentation

## 🛠 Quick Setup

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Select **`Courier_Tracking_API.postman_collection.json`**
4. Click **Import**

### Step 2: Import Environment
1. In Postman, go to **Environments** tab
2. Click **Import**
3. Select **`Courier_Tracking_API.postman_environment.json`**
4. Click **Import**

### Step 3: Select Environment
1. In the top-right corner of Postman
2. Select **"Courier Tracking API Environment"** from the dropdown

## 🔧 Configuration

### Update Base URL
1. Click on the environment name in the top-right
2. Click **Edit** (pencil icon)
3. Update the `base_url` variable:
   - **Development**: `http://localhost:5000`
   - **Production**: `https://your-domain.com`

### Get Authentication Tokens

#### 1. Register a Customer
```http
POST {{base_url}}/api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "customer"
}
```

#### 2. Login to Get Token
```http
POST {{base_url}}/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 3. Update Environment Variables
1. Copy the token from the response
2. In Postman environment, update `customer_token` with the token value

## 🧪 Testing Flow

### 1. Authentication
- **Register User** - Create a new account
- **Login User** - Get authentication token

### 2. Parcel Management
- **Create Parcel** - Create a new parcel (requires customer token)
- **Track Parcel** - Track parcel by tracking ID (public)
- **Get My Parcels** - Get customer's parcels (requires customer token)

### 3. Agent Management
- **Create Agent** - Create a new agent (requires admin token)
- **Update Agent Location** - Update agent's location (requires agent token)

### 4. Payments
- **Create Payment** - Create a payment for a parcel (requires customer token)

### 5. Analytics
- **Dashboard Analytics** - Get dashboard statistics (requires admin token)

## 🔑 Token Management

### Getting Different Tokens

#### Customer Token
1. Register/login as a customer
2. Copy the token from response
3. Update `customer_token` in environment

#### Admin Token
1. Register/login with role "admin"
2. Copy the token from response
3. Update `admin_token` in environment

#### Agent Token
1. Register/login as an agent
2. Copy the token from response
3. Update `agent_token` in environment

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:5000` |
| `admin_token` | Admin JWT token | `eyJhbGciOiJIUzI1NiIs...` |
| `customer_token` | Customer JWT token | `eyJhbGciOiJIUzI1NiIs...` |
| `agent_token` | Agent JWT token | `eyJhbGciOiJIUzI1NiIs...` |
| `user_id` | User ObjectId | `507f1f77bcf86cd799439011` |
| `parcel_id` | Parcel ObjectId | `507f1f77bcf86cd799439012` |
| `agent_id` | Agent ObjectId | `507f1f77bcf86cd799439013` |
| `tracking_id` | Tracking ID | `TRK123456789ABC` |

## 🚨 Common Issues

### 1. "Unauthorized" Error
- **Solution**: Make sure you have a valid token in the environment variables
- **Check**: Verify the token hasn't expired

### 2. "Forbidden" Error
- **Solution**: Use the correct token for the endpoint
- **Example**: Use `admin_token` for admin-only endpoints

### 3. "Not Found" Error
- **Solution**: Check if the IDs in environment variables are correct
- **Update**: Replace placeholder IDs with actual IDs from your database

### 4. Connection Error
- **Solution**: Make sure the backend server is running
- **Check**: Verify the `base_url` is correct

## 📊 Testing Scenarios

### Scenario 1: Customer Journey
1. Register a customer
2. Login to get token
3. Create a parcel
4. Track the parcel
5. View my parcels

### Scenario 2: Admin Journey
1. Register an admin
2. Login to get token
3. Create an agent
4. View analytics
5. Manage settings

### Scenario 3: Agent Journey
1. Register an agent
2. Login to get token
3. Update location
4. Update status
5. View assigned parcels

## 🔄 Auto-Response Scripts

You can add these scripts to automatically extract tokens:

### For Login Response
```javascript
// Add this to the "Tests" tab of Login request
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("customer_token", response.data.token);
        pm.environment.set("user_id", response.data.user._id);
    }
}
```

### For Register Response
```javascript
// Add this to the "Tests" tab of Register request
if (pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("customer_token", response.data.token);
        pm.environment.set("user_id", response.data.user._id);
    }
}
```

## 📚 Additional Resources

- **API Documentation**: `API_Documentation.md`
- **Swagger UI**: `http://localhost:5000/api/docs`
- **GitHub Repository**: https://github.com/mr7aali/courier-track-backend

## 🆘 Support

If you encounter issues:
1. Check the API documentation
2. Verify the backend server is running
3. Check environment variables
4. Review the README.md file
5. Create an issue in the repository

---

**Happy Testing! 🚀** 