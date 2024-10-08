const express = require('express');
const User = require('../models/User'); // Adjust path accordingly
const router = express.Router();
require('dotenv').config();

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    // Fetch all users from the database and select required fields
    const users = await User.find().select('-password -__v'); // Exclude password and version

    // If no users are found
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Map the users to include the full URL for the profile picture
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: `${req.protocol}://${req.get('host')}${user.profilePicture}`, // Construct full URL for the profile picture
      preferences: user.preferences, // Include user preferences if needed
      wishlist: user.wishlist,
      bookings: user.bookings,
      payments: user.payments,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user/preferences: Fetch user vacation preferences
router.get('/preferences', async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Assuming req.userId is being set elsewhere

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const { vacationType, notificationMethods } = user.preferences; // Extract preferences

    res.status(200).json({
      success: true,
      message: 'User preferences retrieved successfully.',
      data: {
        vacationType,
        notificationMethods
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Could not retrieve user preferences.',
      error: error.message
    });
  }
});


module.exports = router;
