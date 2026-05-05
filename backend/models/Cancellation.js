import mongoose from 'mongoose';

const CancellationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String,
  userEmail: String,
  eventTitle: String,
  cancelledAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Cancellation', CancellationSchema);
