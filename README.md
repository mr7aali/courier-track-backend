# 🚚 Courier Tracking Backend

A comprehensive courier tracking and management system built with NestJS, MongoDB, and TypeScript. This backend provides a robust API for managing parcels, agents, customers, payments, and real-time tracking.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Authentication & Authorization](#-authentication--authorization)
- [API Endpoints](#-api-endpoints)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### Core Features
- **Parcel Management**: Create, track, and manage parcels with unique tracking IDs
- **Agent Management**: Manage delivery agents with real-time location tracking
- **Customer Management**: User registration and profile management
- **Payment Processing**: Support for COD and online payments
- **Real-time Tracking**: Live parcel tracking with location updates
- **Notifications**: Email, SMS, and in-app notifications
- **Analytics & Reporting**: Comprehensive analytics and report generation
- **Settings Management**: Configurable system settings

### Advanced Features
- **QR Code Generation**: Automatic QR code generation for parcels
- **Route Optimization**: Optimized delivery routes for agents
- **Status Tracking**: Detailed parcel status history
- **Role-based Access**: Admin, Agent, and Customer roles
- **API Documentation**: Swagger/OpenAPI documentation
- **WebSocket Support**: Real-time updates via WebSocket

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Database**: [MongoDB](https://www.mongodb.com/) - NoSQL database
- **ORM**: [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- **Authentication**: [JWT](https://jwt.io/) - JSON Web Tokens
- **Validation**: [class-validator](https://github.com/typestack/class-validator) - Decorator-based validation
- **Documentation**: [Swagger/OpenAPI](https://swagger.io/) - API documentation
- **Testing**: [Jest](https://jestjs.io/) - Testing framework

## 📁 Project Structure

```
src/
├── agents/                 # Agent management
│   ├── dto/               # Data Transfer Objects
│   ├── schemas/           # MongoDB schemas
│   ├── agents.controller.ts
│   ├── agents.service.ts
│   └── agents.module.ts
├── analytics/             # Analytics and reporting
├── auth/                  # Authentication & authorization
│   ├── guard/            # JWT and role guards
│   ├── strategy/         # JWT strategy
│   └── encrypt/          # Password encryption
├── common/               # Shared utilities
│   ├── decorators/       # Custom decorators
│   ├── dto/             # Common DTOs
│   └── guards/          # Shared guards
├── database/             # Database configuration
├── notifications/        # Notification system
├── parcels/             # Parcel management
├── payments/            # Payment processing
├── reports/             # Report generation
├── settings/            # System settings
├── tracking/            # Real-time tracking
├── users/               # User management
├── websocket/           # WebSocket gateway
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI and is available at:
- **Swagger UI**: `http://localhost:5000/api/docs`
- **OpenAPI JSON**: `http://localhost:5000/api-json`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd courier-track-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run start:dev
   # or
   yarn start:dev
   ```

The application will be available at `http://localhost:5000`

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/courier-db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🗄 Database Schema

### Core Entities

#### User
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `phone`: String
- `password`: String (hashed)
- `role`: Enum ['customer', 'agent', 'admin']
- `status`: Enum ['active', 'inactive', 'suspended']
- `createdAt`: Date
- `updatedAt`: Date

#### Parcel
- `_id`: ObjectId
- `trackingId`: String (unique)
- `customerId`: ObjectId (ref: User)
- `agentId`: ObjectId (ref: User, optional)
- `recipientName`: String
- `recipientPhone`: String
- `pickupAddress`: String
- `deliveryAddress`: String
- `parcelSize`: Enum ['small', 'medium', 'large', 'extra_large']
- `parcelType`: Enum ['document', 'package', 'fragile', 'electronics', 'clothing', 'food', 'other']
- `weight`: Number
- `paymentType`: Enum ['cod', 'prepaid']
- `codAmount`: Number (optional)
- `deliveryFee`: Number
- `status`: String
- `statusHistory`: Array
- `currentLocation`: Object
- `qrCode`: String
- `barcode`: String
- `createdAt`: Date
- `updatedAt`: Date

#### Agent
- `_id`: ObjectId
- `userId`: ObjectId (ref: User)
- `vehicleType`: Enum ['bike', 'car', 'van', 'truck']
- `status`: Enum ['available', 'busy', 'offline']
- `currentLocation`: Object
- `serviceAreas`: Array
- `rating`: Number
- `totalDeliveries`: Number
- `createdAt`: Date
- `updatedAt`: Date

## 🔐 Authentication & Authorization

### JWT Authentication
The application uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Role-based Access Control
- **Admin**: Full access to all features
- **Agent**: Access to assigned parcels and location updates
- **Customer**: Access to own parcels and profile

### Guards
- `JwtAuthGuard`: Validates JWT tokens
- `RolesGuard`: Enforces role-based access
- `AdminGuard`: Admin-only access
- `ManagerGuard`: Manager-level access

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Users
- `GET /api/v1/users` - Get all users (Admin)
- `POST /api/v1/users` - Create user (Admin)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (Admin)
- `GET /api/v1/users/stats` - User statistics (Admin)

### Parcels
- `POST /api/v1/parcels` - Create parcel (Customer)
- `GET /api/v1/parcels` - Get all parcels (Admin/Agent)
- `GET /api/v1/parcels/my-parcels` - Get customer parcels (Customer)
- `GET /api/v1/parcels/assigned` - Get assigned parcels (Agent)
- `GET /api/v1/parcels/stats` - Parcel statistics (Admin)
- `GET /api/v1/parcels/track/:trackingId` - Track parcel (Public)
- `GET /api/v1/parcels/:id` - Get parcel by ID
- `PATCH /api/v1/parcels/:id` - Update parcel (Admin/Agent)
- `PATCH /api/v1/parcels/:id/status` - Update parcel status (Admin/Agent)
- `PATCH /api/v1/parcels/:id/assign-agent` - Assign agent (Admin)

### Agents
- `POST /api/v1/agents` - Create agent (Admin)
- `GET /api/v1/agents` - Get all agents (Admin)
- `GET /api/v1/agents/available` - Get available agents (Admin)
- `GET /api/v1/agents/stats` - Agent statistics (Admin)
- `GET /api/v1/agents/profile` - Get agent profile (Agent)
- `GET /api/v1/agents/:id` - Get agent by ID
- `PATCH /api/v1/agents/:id` - Update agent (Admin/Agent)
- `PATCH /api/v1/agents/:id/location` - Update location (Agent)
- `PATCH /api/v1/agents/:id/status` - Update status (Agent)
- `DELETE /api/v1/agents/:id` - Delete agent (Admin)

### Tracking
- `GET /api/v1/tracking/:trackingId` - Get parcel location
- `PATCH /api/v1/tracking/:parcelId/location` - Update parcel location (Agent)
- `GET /api/v1/tracking/agent/:agentId/route` - Get optimized route (Agent/Admin)

### Payments
- `POST /api/v1/payments` - Create payment (Customer)
- `POST /api/v1/payments/create-intent` - Create Stripe intent (Customer)
- `GET /api/v1/payments` - Get all payments (Admin)
- `GET /api/v1/payments/stats` - Payment statistics (Admin)
- `PATCH /api/v1/payments/:id/confirm` - Confirm payment (Admin/Customer)
- `PATCH /api/v1/payments/:id/fail` - Mark payment failed (Admin)

### Notifications
- `POST /api/v1/notifications` - Create notification (Admin)
- `GET /api/v1/notifications` - Get user notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `PATCH /api/v1/notifications/mark-all-read` - Mark all as read

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard analytics (Admin)
- `GET /api/v1/analytics/parcels` - Parcel analytics (Admin)
- `GET /api/v1/analytics/revenue` - Revenue analytics (Admin)
- `GET /api/v1/analytics/agents/performance` - Agent performance (Admin)
- `GET /api/v1/analytics/customers/top` - Top customers (Admin)
- `GET /api/v1/analytics/failed-deliveries` - Failed deliveries (Admin)

### Settings
- `POST /api/v1/settings` - Create setting (Admin)
- `GET /api/v1/settings` - Get all settings
- `GET /api/v1/settings/public` - Get public settings
- `GET /api/v1/settings/:key` - Get setting by key
- `GET /api/v1/settings/:key/value` - Get setting value
- `PATCH /api/v1/settings/:key` - Update setting (Admin)
- `PATCH /api/v1/settings/:key/value` - Update setting value (Admin)
- `DELETE /api/v1/settings/:key` - Delete setting (Admin)

### Reports
- `GET /api/v1/reports/parcels` - Generate parcels report (Admin)
- `GET /api/v1/reports/revenue` - Generate revenue report (Admin)
- `GET /api/v1/reports/agents` - Generate agents report (Admin)

## 💻 Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode with hot reload
npm run start              # Start in production mode
npm run start:prod         # Start in production mode

# Build
npm run build              # Build the application
npm run build:webpack      # Build with webpack

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage
npm run test:debug         # Run tests in debug mode

# Linting & Formatting
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run format             # Format code with Prettier
```

### Code Quality

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Jest** for testing

### Database Migrations

The application automatically initializes default settings and indexes on startup. No manual migrations are required.

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Test Structure

- `test/` - E2E tests
- `src/**/*.spec.ts` - Unit tests
- `src/**/*.e2e-spec.ts` - E2E tests

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db:27017/courier-db
JWT_SECRET=your-production-jwt-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [API documentation](http://localhost:5000/api/docs)
- Review the [NestJS documentation](https://docs.nestjs.com/)

## 🔗 Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT Documentation](https://jwt.io/)

---

**Built with ❤️ using NestJS**
