const PaymentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer'], required: true },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['paid', 'failed', 'pending'], default: 'pending' },
    receiptUrl: { type: String } // URL to the receipt or invoice
  });
  
  module.exports = mongoose.model('Payment', PaymentSchema);
  