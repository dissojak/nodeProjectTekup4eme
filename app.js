const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(helmet());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Root route
//================================================

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const clientRoutes = require('./routes/clients');
app.use('/api/clients', clientRoutes);

const invoiceRoutes = require('./routes/invoices');
app.use('/api/invoices', invoiceRoutes);

const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Recouvra+ API' });
});
const recoveryActionRoutes = require('./routes/recoveryActions');
app.use('/api/recovery-actions', recoveryActionRoutes);
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);
const statsRoutes = require('./routes/stats');
app.use('/api/stats', statsRoutes);
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);
module.exports = app;
