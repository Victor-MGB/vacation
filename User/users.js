const express = require('express');
const User = require('../models/User'); // Adjust path accordingly
const router = express.Router();
require('dotenv').config();

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find().select('-password'); // Exclude password from response

    // If no users are found
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
