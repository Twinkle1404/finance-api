const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./src/middleware/errorHandler');
const AppError = require('./src/utils/AppError');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const recordRoutes = require('./src/routes/record.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');

const app = express();

// ──── Global Middleware ────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ──── Serve Frontend Dashboard ────
app.use(express.static(path.join(__dirname, 'public')));

// ──── Root / API Info ────
app.get('/', (req, res) => {
  res.json({
    name: 'Finance API',
    version: '1.0.0',
    description: 'Finance Data Processing & Access Control Backend',
    health: '/api/health',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user (public)',
        'POST /api/auth/login': 'Login and receive JWT (public)',
        'GET  /api/auth/me': 'Get current user profile (authenticated)',
      },
      users: {
        'GET    /api/users': 'List all users (admin)',
        'GET    /api/users/:id': 'Get user by ID (admin)',
        'PATCH  /api/users/:id/role': 'Update user role (admin)',
        'PATCH  /api/users/:id/status': 'Activate/deactivate user (admin)',
        'DELETE /api/users/:id': 'Delete user (admin)',
      },
      records: {
        'POST   /api/records': 'Create financial record (admin)',
        'GET    /api/records': 'List records — filters: type, category, from, to, page, limit, sort, order (viewer+)',
        'GET    /api/records/:id': 'Get single record (viewer+)',
        'PUT    /api/records/:id': 'Update record (admin)',
        'DELETE /api/records/:id': 'Soft-delete record (admin)',
      },
      dashboard: {
        'GET /api/dashboard/summary': 'Income/expense totals — filters: from, to, type, category, user_id (analyst+)',
        'GET /api/dashboard/category-breakdown': 'Category-wise totals — same filters (analyst+)',
        'GET /api/dashboard/monthly-trends': 'Monthly income vs expense — same filters (analyst+)',
        'GET /api/dashboard/recent-activity': 'Last N records — filters + limit (viewer+)',
      },
    },
    demo_accounts: {
      admin: 'admin@finance.com / admin123',
      analyst: 'analyst@finance.com / analyst123',
      viewer: 'viewer@finance.com / viewer123',
    },
  });
});

// ──── Health Check ────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ──── API Routes ────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ──── 404 Handler ────
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
});

// ──── Global Error Handler ────
app.use(errorHandler);

module.exports = app;
