const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
 

const app = express();




// Middleware
app.use(cors({
  origin: '*', // Allows all origins
  methods: 'GET, POST, PUT, DELETE', // Allowed HTTP methods
  allowedHeaders: 'Content-Type, Authorization', // Allowed headers
}));



app.use(express.json());

const mongoose = require('mongoose');

//This was the only available method i could make work
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// This MongoDB Setup didnt work as expected
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

// Lesson Schema
const lessonSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  spaces: { type: Number, required: true, min: 1 },
});

const Lesson = mongoose.model('Lesson', lessonSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
});

const Order = mongoose.model('Order', orderSchema);

// GET /lessons - Fetch all lessons
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// GET /lessons/:id - Fetch a specific lesson by ID
app.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// POST /lessons - Create a new lesson
app.post('/lessons', async (req, res) => {
  const { subject, location, price, spaces } = req.body;

  try {
    const lesson = new Lesson({ subject, location, price, spaces });
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// PUT /lessons/:id - Update an existing lesson by ID
app.put('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// DELETE /lessons/:id - Delete a lesson by ID
app.delete('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});


// GET /orders - Fetch all orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('lessons'); // Populate lesson details in the order
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /orders/:id - Fetch a specific order by ID
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('lessons');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /orders - Create a new order
app.post('/orders', async (req, res) => {
  const { name, phone, lessons } = req.body;

  try {
    // Check if all lessons exist
    const existingLessons = await Lesson.find({ '_id': { $in: lessons } });
    if (existingLessons.length !== lessons.length) {
      return res.status(400).json({ error: 'Some lessons do not exist' });
    }

    const order = new Order({ name, phone, lessons });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /orders/:id - Update an existing order by ID
app.put('/orders/:id', async (req, res) => {
  const { name, phone, lessons } = req.body;

  try {
    // Check if all lessons exist
    const existingLessons = await Lesson.find({ '_id': { $in: lessons } });
    if (existingLessons.length !== lessons.length) {
      return res.status(400).json({ error: 'Some lessons do not exist' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { name, phone, lessons }, { new: true }).populate('lessons');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /orders/:id - Delete an order by ID
app.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
