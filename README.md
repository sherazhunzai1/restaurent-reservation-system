# Restaurant Reservation System - Admin Panel

A full-featured restaurant reservation management admin panel built with Node.js, EJS, and MySQL (Sequelize ORM). Designed to be reusable across different restaurants by configuring the `.env` file.

## Features

- **Dashboard** - Real-time overview with today/monthly/yearly reservation stats, charts, and upcoming reservations
- **Reservation Management** - Full CRUD, status workflow (pending → confirmed → seated → completed), search & filters, quick status actions
- **Today's Reservations** - Dedicated view for daily operations with quick action buttons
- **Calendar View** - Monthly calendar showing reservation counts per day
- **Reports & Analytics** - Daily, monthly, and yearly reservation reports with charts and source distribution
- **Table Management** - Add/edit/delete tables with capacity, location, and status tracking
- **Operating Hours** - Configure opening/closing times and last reservation time for each day of the week
- **Special Dates & Holidays** - Manage closures and special operating hours
- **Staff Management** - Add/remove staff members with role-based access (super_admin, admin, staff)
- **Admin Profile** - Update profile info and change password
- **Authentication** - Secure login/logout with session management
- **Multi-Restaurant Support** - Restaurant name, logo, and details configured via `.env`

## Tech Stack

- **Backend:** Node.js, Express.js
- **View Engine:** EJS with express-ejs-layouts
- **Database:** MySQL with Sequelize ORM
- **Auth:** bcryptjs, express-session
- **UI:** Bootstrap 5, Bootstrap Icons, Chart.js

## Setup

### Prerequisites
- Node.js (v16+)
- MySQL Server

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd restaurent-reservation-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a MySQL database:
   ```sql
   CREATE DATABASE restaurant_reservation;
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and restaurant details.

5. Seed the database (creates admin user and sample data):
   ```bash
   npm run seed
   ```

6. Start the server:
   ```bash
   npm start
   ```

7. Open http://localhost:3000 in your browser.

### Default Login
- **Username:** admin
- **Password:** admin123

## Configuration for Different Restaurants

Edit the `.env` file to customize for each restaurant:

```env
RESTAURANT_NAME=Your Restaurant Name
RESTAURANT_LOGO=/uploads/logo.png
RESTAURANT_TAGLINE=Your Tagline
RESTAURANT_EMAIL=contact@yourrestaurant.com
RESTAURANT_PHONE=+1 (555) 000-0000
RESTAURANT_ADDRESS=Your Address
RESTAURANT_CURRENCY=USD
RESTAURANT_TIMEZONE=America/New_York
```

## Project Structure

```
├── app.js                  # Application entry point
├── config/
│   └── database.js         # Sequelize database config
├── controllers/            # Route controllers
├── middlewares/             # Auth & middleware
├── models/                 # Sequelize models
├── public/                 # Static assets (CSS, JS, uploads)
├── routes/                 # Express routes
├── seeders/                # Database seeders
└── views/                  # EJS templates
    ├── layout.ejs          # Main layout
    ├── partials/           # Reusable partials
    └── pages/              # Page templates
```
