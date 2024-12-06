const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson'); // Import the Lesson model

// Get all lessons with sorting
router.get('/', async (req, res) => {
  const { sort, order } = req.query;

  try {
    const sortOptions = {};
    if (sort) sortOptions[sort] = order === 'asc' ? 1 : -1;

    const lessons = await Lesson.find().sort(sortOptions); // Use Mongoose's find and sort
    res.json(lessons);
  } catch (err) {
    console.error('Failed to fetch lessons:', err);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Add a new lesson
router.post('/', async (req, res) => {
  const { subject, location, price, spaces } = req.body;

  if (!subject || !location || !price || !spaces) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newLesson = new Lesson({ subject, location, price, spaces });

    const savedLesson = await newLesson.save(); // Save the new lesson using Mongoose

    res.status(201).json(savedLesson); // Return the saved lesson
  } catch (err) {
    console.error('Failed to create lesson:', err);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

module.exports = router;
