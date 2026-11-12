require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const villageRoutes = require('./routes/villageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/villages', villageRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✓ MongoDB connected successfully!'))
  .catch((err) => console.error('✗ MongoDB error:', err.message));

app.get('/', (req, res) => {
  res.json({ message: 'DAJGUA backend running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});