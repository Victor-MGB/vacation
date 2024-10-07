const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
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

router.post('/login', cors(), [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Create and sign the JWT
    const token = jwt.sign(
      { id: user._id }, // payload with user ID
      process.env.JWT_SECRET, // your secret key
      { expiresIn: '1h' } // token expiration time
    );

    // Save the token in the user document
    user.token = token; // Assign the token to the user object
    await user.save(); // Save the user with the token


    // Send the response with user data and token
    res.json({
      status: 'success',
      message: 'User logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        preferences: user.preferences
      }
    });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});


router.post('/logout', cors(), (req, res) => {
  try {
    // No actual server-side logout is necessary with JWT unless blacklisting tokens.
    // Simply inform the client to remove the token.
    
    res.status(200).json({
      status: 'success',
      message: 'User logged out successfully. Please remove the token from storage.'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  // Remove 'Bearer ' prefix from the token if present
  const tokenWithoutBearer = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
    req.userId = decoded.id; // Assuming JWT payload includes user ID
    next();
  });
};

// @desc Fetch user profile information
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // Fetch the user profile based on the userId decoded from the token
    const user = await User.findById(req.userId).select('-password'); // Exclude the password from the result

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Return the user profile details
    res.status(200).json({
      status: 'success',
      user
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
