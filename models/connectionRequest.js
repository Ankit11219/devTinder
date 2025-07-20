const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
  fromUserId: { // senderId
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  toUserId: { // receiverId
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: {
      values: ['ignored', 'interested', 'accepted', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    required: true
  }
}, {
  timestamps: true
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true }); // Ensure unique connection requests between users

connectionRequestSchema.pre('save', function(next) {
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error('Sender and receiver cannot be the same user');
    }
    next();
});

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequest;
