require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const hash = await bcrypt.hash('admin123', 10);
  await User.create({ 
    email: 'admin@dajgua.gov.in', 
    password: hash 
  });
  console.log('✅ Admin user created!');
  process.exit();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit();
});