const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and Email are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    const newUser = new User({ name, email, photo });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});


// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user); // You can send token here if auth is added later
  } catch (error) {
    res.status(500).json({ message: 'Failed to login', error });
  }
});


module.exports = router;
