require('dotenv').config();
const { sequelize, Admin, Table, Reservation, RestaurantSettings, OperatingHours, TableLocation } = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // Create default admin
    await Admin.create({
      username: 'admin',
      email: 'admin@restaurant.com',
      password: 'admin123',
      full_name: 'Admin User',
      role: 'super_admin',
    });
    console.log('Default admin created (username: admin, password: admin123)');

    // Create default table locations
    const locationsData = [
      { name: 'Indoor', icon: 'grid' },
      { name: 'Outdoor', icon: 'tree' },
      { name: 'Private Room', icon: 'door-closed' },
      { name: 'Bar', icon: 'cup-straw' },
      { name: 'Patio', icon: 'sun' },
    ];
    const locations = await TableLocation.bulkCreate(locationsData);
    console.log('Default table locations created.');

    const locMap = {};
    locations.forEach(l => { locMap[l.name] = l.id; });

    // Create tables
    const tablesData = [
      { table_number: 'T1', capacity: 2, location_id: locMap['Indoor'] },
      { table_number: 'T2', capacity: 2, location_id: locMap['Indoor'] },
      { table_number: 'T3', capacity: 4, location_id: locMap['Indoor'] },
      { table_number: 'T4', capacity: 4, location_id: locMap['Indoor'] },
      { table_number: 'T5', capacity: 6, location_id: locMap['Indoor'] },
      { table_number: 'T6', capacity: 6, location_id: locMap['Indoor'] },
      { table_number: 'T7', capacity: 8, location_id: locMap['Private Room'] },
      { table_number: 'T8', capacity: 4, location_id: locMap['Outdoor'] },
      { table_number: 'T9', capacity: 4, location_id: locMap['Outdoor'] },
      { table_number: 'T10', capacity: 2, location_id: locMap['Bar'] },
    ];
    await Table.bulkCreate(tablesData);
    console.log('Sample tables created.');

    // Create default settings
    await RestaurantSettings.create({});
    console.log('Default settings created.');

    // Create operating hours
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
      await OperatingHours.create({
        day_of_week: i,
        day_name: days[i],
        is_open: i >= 1 && i <= 6,
        opening_time: '11:00',
        closing_time: '22:00',
        last_reservation_time: '21:00',
      });
    }
    console.log('Operating hours created.');

    // Create sample reservations
    const today = new Date();
    const sampleReservations = [];
    const statuses = ['pending', 'confirmed', 'seated', 'completed', 'cancelled'];
    const sources = ['admin', 'phone', 'online', 'walk_in'];
    const names = [
      'John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis',
      'James Wilson', 'Jessica Taylor', 'Robert Anderson', 'Ashley Thomas',
      'David Martinez', 'Amanda Jackson', 'Daniel White', 'Megan Harris',
      'Christopher Martin', 'Stephanie Garcia', 'Matthew Robinson',
    ];

    for (let d = -30; d <= 14; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      const numReservations = Math.floor(Math.random() * 5) + 1;

      for (let r = 0; r < numReservations; r++) {
        const hour = 11 + Math.floor(Math.random() * 10);
        const minute = Math.random() > 0.5 ? '00' : '30';
        const name = names[Math.floor(Math.random() * names.length)];

        sampleReservations.push({
          reservation_code: `RES-${String(Math.random().toString(36).substring(2, 8)).toUpperCase()}`,
          customer_name: name,
          customer_email: name.toLowerCase().replace(' ', '.') + '@email.com',
          customer_phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          party_size: Math.floor(Math.random() * 6) + 1,
          reservation_date: dateStr,
          reservation_time: `${String(hour).padStart(2, '0')}:${minute}`,
          table_id: Math.floor(Math.random() * 10) + 1,
          status: d < 0 ? (Math.random() > 0.2 ? 'completed' : 'cancelled') : statuses[Math.floor(Math.random() * 3)],
          source: sources[Math.floor(Math.random() * sources.length)],
          created_by: 1,
        });
      }
    }

    await Reservation.bulkCreate(sampleReservations);
    console.log(`${sampleReservations.length} sample reservations created.`);

    console.log('\nSeeding completed successfully!');
    console.log('Login credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
