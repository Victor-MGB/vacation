const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const multer = require('multer');
const router = express.Router();
const cors = require("cors");
const path = require('path'); // Include the path module
const fs = require('fs'); // Include the fs module

// Set up Multer for profile picture uploads (optional)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profile-pictures');
    
    // Check if the directory exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // recursive: true creates nested directories if they don't exist
    }
  
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
  
const upload = multer({ storage });

// @route POST /api/auth/register
// @desc Register a new user
router.post('/register', cors(),
  upload.single('profilePicture'),  // Accept a file upload for profile picture
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, vacationType, notificationMethods } = req.body;

    try {
      // Parse notificationMethods as a JSON object if it's a string
      let parsedNotificationMethods;
      try {
        parsedNotificationMethods = JSON.parse(notificationMethods);
      } catch (err) {
        return res.status(400).json({ status: 'error', message: 'Invalid notificationMethods format' });
      }

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ status: 'error', message: 'User already exists' });
      }

      // Create a new user instance
      user = new User({
        name,
        email,
        password,
        phone,
        preferences: {
          vacationType,
          notificationMethods: parsedNotificationMethods
        }
      });

      // Handle profile picture upload
      if (req.file) {
        user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
      }

      // Hash password before saving it
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save the user to the database
      await user.save();

      console.log(`User registered: ${name}, Email: ${email}`); // Log registration attempt

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          vacationType: user.preferences.vacationType,
          notificationMethods: user.preferences.notificationMethods,
          profilePicture: user.profilePicture
        }
      });

    } catch (error) {
      console.error(error.message);
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  }
);

module.exports = router;
