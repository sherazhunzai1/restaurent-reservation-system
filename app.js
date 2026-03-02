require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const { sequelize } = require('./models');
const { setLocals } = require('./middlewares/auth');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const reservationRoutes = require('./routes/reservations');
const tableRoutes = require('./routes/tables');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
  },
}));

// Flash Messages
app.use(flash());

// Set Locals (restaurant info, admin, flash messages)
app.use(setLocals);

// Routes
app.get('/', (req, res) => res.redirect('/dashboard'));
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reservations', reservationRoutes);
app.use('/tables', tableRoutes);
app.use('/settings', settingsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('pages/login', {
    layout: false,
    error: ['Page not found'],
    success: [],
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('pages/login', {
    layout: false,
    error: ['Internal server error'],
    success: [],
  });
});

// Database Sync & Start Server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync({ alter: true });
    console.log('Database tables synced.');

    app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`  ${process.env.RESTAURANT_NAME || 'Restaurant'} Admin Panel`);
      console.log(`  Running on http://localhost:${PORT}`);
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error('\nMake sure MySQL is running and the database exists.');
    console.error('Create the database with: CREATE DATABASE restaurant_reservation;');
    console.error('Then update your .env file with the correct credentials.\n');
    process.exit(1);
  }
}

startServer();
