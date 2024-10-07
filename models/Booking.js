const BookingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['confirmed', 'pending', 'cancelled'], default: 'pending' },
    numberOfPeople: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['paid', 'due', 'overdue'], default: 'due' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Booking', BookingSchema);
  