const express = require('express');
const connectionRequestRouter = express.Router();

const ConnectionRequest = require('../models/connectionRequest');
const userAuth = require('../middlewares/userAuth');
const User = require('../models/user');

// Endpoint to create a new connection request
connectionRequestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const { status, toUserId } = req.params;
        const fromUserId = req.user._id;
        if (!['ignored', 'interested'].includes(status)) {
            throw new Error('Invalid status');
        }
        if (!toUserId) {
            throw new Error('toUserId is required');
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            throw new Error('User not found');
        }

        ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ],
            status: { $in: ['ignored', 'interested'] }
        }).then(existingRequest => {
            if (existingRequest) {
                throw new Error('Connection request already exists');
            }
        });

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        await connectionRequest.save();
        res.status(201).json({ message: 'Connection request created successfully', data: connectionRequest });
    } catch (error) {
        // console.error('Error creating connection request:', error.message);
        res.status(400).json({ error: error.message });
    }
});