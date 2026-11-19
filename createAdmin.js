require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  await User.deleteMany({ email: 'admin@dajgua.gov.in' });

  const USE_PLAIN_PASSWORD = false; // set true ONLY if User.js hashes in pre('save')
  const password = USE_PLAIN_PASSWORD
    ? 'admin123'
    : await bcrypt.hash('admin123', 10);

  await User.create({ email: 'admin@dajgua.gov.in', password });
  console.log('✅ Admin user created!');
  process.exit();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});