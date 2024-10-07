const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  profilePicture: { type: String }, // URL to the profile picture
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Destination' }], // References to wishlist items
  bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }], // References to bookings
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }], // References to payment records
  preferences: {
    vacationType: { type: String }, // e.g., 'beaches', 'mountains'
    notificationMethods: { email: Boolean, SMS: Boolean }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
