/**
 * Seed script — creates 1 admin, 10 staff, and 3 fuel types
 * Run: node utils/seedAdmin.js   OR   npm run seed (from backend/)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Fuel = require('../models/Fuel');

const ADMIN = {
  name: 'Super Admin',
  email: 'admin@petrolpump.com',
  password: 'Admin@123',
  role: 'admin',
};

const STAFF_MEMBERS = [
  { name: 'Ravi Kumar',    email: 'staff1@petrolpump.com',  password: 'Staff@123', role: 'staff' },
  { name: 'Priya Sharma',  email: 'staff2@petrolpump.com',  password: 'Staff@123', role: 'staff' },
  { name: 'Amit Singh',    email: 'staff3@petrolpump.com',  password: 'Staff@123', role: 'staff' },
  { name: 'Sunita Devi',   email: 'staff4@petrolpump.com',  password: 'Staff@123', role: 'staff' },
  { name: 'Deepak Patel',  email: 'staff5@petrolpump.com',  password: 'Staff@123', role: 'staff' },
  { name: 'Anjali Gupta',  email: 'staff6@petrolpump.com',  password: 'Staff@123', role: 'staff' },
  { name: 'Ramesh Yadav',  email: 'staff7@petrolpump.com',  password: 'Staff@123', role: 'staff' },
  { name: 'Kavita Joshi',  email: 'staff8@petrolpump.com',  password: 'Staff@123', role: 'staff' },
  { name: 'Suresh Verma',  email: 'staff9@petrolpump.com',  password: 'Staff@123', role: 'staff' },
  { name: 'Pooja Mehta',   email: 'staff10@petrolpump.com', password: 'Staff@123', role: 'staff' },
];

const FUELS = [
  { name: 'Petrol', pricePerLiter: 96.72, stock: 5000 },
  { name: 'Diesel', pricePerLiter: 89.62, stock: 8000 },
  { name: 'CNG',    pricePerLiter: 76.59, stock: 3000 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // -------- Admin --------
    const existingAdmin = await User.findOne({ email: ADMIN.email });
    if (!existingAdmin) {
      await User.create(ADMIN);
      console.log(`✅ Admin created: ${ADMIN.email} / ${ADMIN.password}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${ADMIN.email}`);
    }

    // -------- Staff --------
    let staffCreated = 0;
    for (const s of STAFF_MEMBERS) {
      const exists = await User.findOne({ email: s.email });
      if (!exists) {
        await User.create(s);
        console.log(`✅ Staff created: ${s.name} <${s.email}>`);
        staffCreated++;
      } else {
        console.log(`ℹ️  Staff already exists: ${s.email}`);
      }
    }

    // -------- Fuels --------
    console.log('');
    for (const fuel of FUELS) {
      const exists = await Fuel.findOne({ name: fuel.name });
      if (!exists) {
        await Fuel.create(fuel);
        console.log(`✅ Fuel created: ${fuel.name} @ ₹${fuel.pricePerLiter}/L (${fuel.stock}L stock)`);
      } else {
        console.log(`ℹ️  Fuel already exists: ${fuel.name}`);
      }
    }

    const totalUsers = await User.countDocuments();
    console.log(`\n🚀 Seed complete! ${totalUsers} users in DB.`);
    console.log('─────────────────────────────────────────');
    console.log('  Admin  : admin@petrolpump.com / Admin@123');
    console.log('  Staff  : staff1@petrolpump.com … staff10@petrolpump.com / Staff@123');
    console.log('─────────────────────────────────────────\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
