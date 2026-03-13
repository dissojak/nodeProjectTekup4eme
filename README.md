# Recouvra+ - Debt Recovery Management API

REST API for managing clients, unpaid invoices and recovery actions.

## Quick Start

```bash
git clone <repository-url>
cd nodeProjectTekup4eme
npm install
npm run dev
```

Access `http://localhost:5500/api-docs` for Swagger documentation.

## Technologies

- **Node.js** 22
- **Express.js** v5.2.1 - Web framework
- **MongoDB** + **Mongoose** - Database
- **JWT** (jsonwebtoken) - Authentication
- **express-validator** - Validation
- **Swagger** - API Documentation
- **Jest** + **Supertest** - Unit tests
- **bcryptjs** - Password hashing
- **Helmet** - HTTP Security

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file at the root:

```env
PORT=5500
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/RECOUVRA_PLUS
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

## Running

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server starts on `http://localhost:5500`.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - User profile

### Clients
- `GET /api/clients` - List
- `GET /api/clients/:id` - Detail
- `POST /api/clients` - Create (Agent, Manager)
- `PUT /api/clients/:id` - Update (Agent, Manager)
- `DELETE /api/clients/:id` - Delete (Manager, Admin)

### Invoices
- `GET /api/invoices` - List
- `GET /api/invoices/:id` - Detail
- `GET /api/invoices/client/:clientId` - By client
- `POST /api/invoices` - Create (Agent, Manager)
- `PUT /api/invoices/:id` - Update (Agent, Manager)
- `DELETE /api/invoices/:id` - Delete (Manager, Admin)

### Payments
- `GET /api/payments` - List
- `GET /api/payments/invoice/:invoiceId` - By invoice
- `POST /api/payments` - Record (Agent, Manager)

### Recovery Actions
- `GET /api/recovery-actions` - List
- `GET /api/recovery-actions/client/:clientId` - By client
- `GET /api/recovery-actions/invoice/:invoiceId` - By invoice
- `POST /api/recovery-actions` - Create (Agent, Manager)
- `PUT /api/recovery-actions/:id` - Update (Agent, Manager)
- `DELETE /api/recovery-actions/:id` - Delete (Manager, Admin)

### Users
- `GET /api/users` - List (Admin)
- `GET /api/users/:id` - Detail (Admin, Manager)
- `PUT /api/users/:id` - Update (Admin)
- `DELETE /api/users/:id` - Delete (Admin)

### Statistics
- `GET /api/stats/overview` - Global overview (Manager, Admin)
- `GET /api/stats/invoices` - Invoice data (Manager, Admin)
- `GET /api/stats/agents` - Agent performance (Manager, Admin)

## Design Patterns

- **MVC** - Separation of models/controllers/routes
- **Singleton** - Single connection to MongoDB (`config/db.js`)
- **Chain of Responsibility** - Middleware chain (auth -> validate -> controller -> error)
- **Decorator** - `asyncHandler` for async error handling
- **Factory** - Creation of custom HTTP errors (`utils/HttpError.js`)
- **Strategy** - Payment method processing (cash/check/transfer)

## Project Structure

```
├── config/
│   ├── db.js
│   └── swagger.js
├── controllers/
│   ├── authController.js
│   ├── ...
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validateMiddleware.js
├── models/
│   ├── User.js
│   ├── Client.js
│   ├── Invoice.js
│   ├── Payment.js
│   └── RecoveryAction.js
├── routes/
│   ├── auth.js
│   ├── ...
├── strategies/
│   └── paymentStrategies.js
├── validators/
│   └── *.js
├── utils/
│   ├── generateToken.js
│   └── HttpError.js
├── tests/
│   ├── auth.test.js
│   ├── ...
├── app.js
├── server.js
├── .env
└── package.json
```

## Roles and Permissions

| Action | Agent | Manager | Admin |
|--------|:-----:|:-------:|:-----:|
| View clients/invoices | Yes | Yes | Yes |
| Create/update clients | Yes | Yes | No |
| Delete clients | No | Yes | Yes |
| View statistics | No | Yes | Yes |
| Manage users | No | No | Yes |

## Authentication

1. User registers or logs in
2. JWT generated and stored in httpOnly cookie
3. Middleware `authMiddleware` protects protected routes
4. Middleware `authorize()` verifies the role
5. Controller executes the action
6. Errors captured by `globalErrorHandler`

## Tests

```bash
npm test
```

Tests cover:
- Authentication (register, login, logout, profile)
- Client management (CRUD + validation)
- Invoice management (CRUD + statuses)
- Payments with strategies
- Recovery actions (5 types)
- User management (admin-only)
- Statistics (manager-only)

> Create a `.env.test` file for tests

## Swagger Documentation

Accessible at: `http://localhost:5500/api-docs`

All endpoints are documented with examples and schemas.

## Useful Commands

```bash
# Start the development server
npm run dev

# Run the tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run only auth tests
npm test -- auth.test.js

# Build for production
npm run build
```

## Team

- **Adem** - Setup, Models, Auth, Client CRUD, Payment (Strategy), Swagger, README
- **Baha** - Error Middleware, Invoice, Recovery Actions, User Management, Stats, Tests
