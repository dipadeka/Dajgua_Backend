const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const villageRoutes = require("./routes/village");
app.use("/api/villages", villageRoutes);
mongoose.connect(process.env.MONGO_URI, {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 30000,
  retryWrites: true,
  w: 'majority',
})
  .then(() => console.log('✓ MongoDB connected successfully!'))
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    console.warn('\nTroubleshooting steps:');
    console.warn('1. Verify MongoDB Atlas cluster is running');
    console.warn('2. Check if your IP is whitelisted in Atlas Network Access');
    console.warn('3. Verify MONGO_URI in .env file is correct');
    console.warn('4. Check your internet connection\n');
    console.warn('App will continue running - database will reconnect automatically\n');
  });

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('✓ Mongoose reconnected to MongoDB');
});

app.get('/', (req, res) => {
  res.json({ message: 'DAJGUA backend running!' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});