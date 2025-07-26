const express = require('express');
const userRouter = express.Router();

const userAuth = require('../middlewares/userAuth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const USER_FILTERED_FIELDS = "firstName lastName photoUrl age gender about skills";
// const USER_FILTERED_FIELDS = ['firstName', 'lastName', 'photoUrl', 'age', 'gender', 'about', 'skills']; // Alternative way to define fields to filter

// Endpoint to get all connection requests for the logged-in user
userRouter.get('/requests/received', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const requests = await ConnectionRequest.find({ toUserId: loggedInUser._id, status: "interested" })
            .populate('fromUserId', USER_FILTERED_FIELDS); // Populate sender's details

        res.json({
            message: 'Received connection requests fetched successfully',
            data: requests
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint to get all the logged-in user friends details(connections) 
userRouter.get('/requests/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const loggedInUserConnections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: 'accepted' },
                { toUserId: loggedInUser._id, status: 'accepted' }
            ]
        }).populate('fromUserId', USER_FILTERED_FIELDS).populate('toUserId', USER_FILTERED_FIELDS);

        // fromUserId._id == loggedInUser._id it will not work becuase _id is an object, so we need to use equals method
        const friendsDetails = loggedInUserConnections.map(connection =>
            connection.fromUserId._id.equals(loggedInUser._id) ? connection.toUserId : connection.fromUserId);

        res.json({
            message: 'Connections fetched successfully',
            data: friendsDetails
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

userRouter.get('/feed', userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.query.limit) || 10; // Default to 10 items per page

        limit = Math.min(limit, 50); // Limit to a maximum of 50 items per page
        const skip = (page - 1) * limit; // Calculate the number of items

        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select('fromUserId toUserId');

        const hideUsersFromFeed = new Set(); // Set to store user IDs to hide from feed
        connections.forEach(connection => {
            hideUsersFromFeed.add(connection.fromUserId.toString());
            hideUsersFromFeed.add(connection.toUserId.toString());
        });

        // Fetch users excluding those in the hideUsersFromFeed set
        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } }, // Exclude users who are already connected/requested/ignored/rejected
                { _id: { $ne: loggedInUser._id } } // Exclude the logged-in user(own profile)
            ]
        }).select(USER_FILTERED_FIELDS)
        .skip(skip) // Skip the number of items based on the page
        .limit(limit); // Limit the number of items per page

        res.json({
            message: 'Feed fetched successfully',
            data: users,
            userCount: users.length
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = userRouter;