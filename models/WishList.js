const WishlistSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Wishlist', WishlistSchema);
  