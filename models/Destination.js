const DestinationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    images: [{ type: String }], // Array of image URLs
    pricePerNight: { type: Number, required: true },
    availableFrom: { type: Date },
    availableUntil: { type: Date },
    features: [{ type: String }], // List of features like 'Wi-Fi', 'Pool', 'Breakfast included'
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Destination', DestinationSchema);
  