const express = require('express');
const connectionRequestRouter = express.Router();

const ConnectionRequest = require('../models/connectionRequest');
const userAuth = require('../middlewares/userAuth');
const User = require('../models/user');

connectionRequestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const fromUserId = loggedInUser._id;
        const { status, toUserId } = req.params;
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

        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });
        if (existingRequest) {
            throw new Error('Connection request already exists between these users');
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        await connectionRequest.save();
        res.status(201).json({ message: `${loggedInUser.firstName} is ${status} to ${toUser.firstName}`, data: connectionRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

connectionRequestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    const { status, requestId } = req.params;
    const loggedInUser = req.user;

    try {
        if (!['accepted', 'rejected'].includes(status)) {
            throw new Error('Invalid status');
        }
        if (!requestId) {
            throw new Error('requestId is required');
        }

        const connectionRequest = await ConnectionRequest.findOne({
            fromUserId: requestId,
            toUserId: loggedInUser._id,
            status: 'interested'
        });

        if (!connectionRequest) {
            return res.status(404).json({ error: 'Connection request not found' });
        }

        connectionRequest.status = status;
        await connectionRequest.save();

        res.json({ message: 'Connection request reviewed successfully', data: connectionRequest });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

});

module.exports = connectionRequestRouter; // Export the router for use in app.js