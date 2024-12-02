const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const lessonRoutes = require('./routes/lessons');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Allows all origins
  methods: 'GET, POST, PUT, DELETE', // Allowed HTTP methods
  allowedHeaders: 'Content-Type, Authorization', // Allowed headers
}));

app.use(express.json());

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// // MongoDB Setup
// const client = new MongoClient(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   tls: false,
//   tlsAllowInvalidCertificates: true, 
//   tlsAllowInvalidHostnames: true, 
// });

// client.connect()
//   .then(() => {
//     console.log('MongoDB connected');
//     app.locals.db = client.db('lessonApp'); // Use this to access the database in routes
//   })
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   });

const lessonSchema = new mongoose.Schema({
  subject: String,
  location: String,
  price: Number,
  spaces: Number,
});

const Lesson = mongoose.model('Lesson', lessonSchema);

const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
});

const Order = mongoose.model('Order', orderSchema);

app.get('/lessons', async (req, res) => {
  const lessons = await Lesson.find();
  res.json(lessons);
});

app.post('/order', async (req, res) => {
  const { name, phone, lessons } = req.body;
  const order = new Order({ name, phone, lessons });
  await order.save();
  res.status(201).json(order);
});

app.put('/lessons/:id', async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(lesson);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
