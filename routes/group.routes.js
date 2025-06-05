const express = require('express');
const Group = require('../models/group.model');
const router = express.Router();

// Create new group
router.post('/', async (req, res) => {
  try {
    const { name, createdBy, members, admins } = req.body;
    const group = new Group({ name, createdBy, members, admins });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', error: err.message });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().populate('members admins createdBy');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching groups', error: err.message });
  }
});

// Get groups by user ID in members array
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const groups = await Group.find({ members: userId }).populate('members admins createdBy');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching groups by user ID', error: err.message });
  }
});

// Join a group
router.post('/:groupId/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Failed to join group', error: err.message });
  }
});

module.exports = router;
