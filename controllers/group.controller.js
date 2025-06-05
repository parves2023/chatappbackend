const Group = require('../models/group.model');

exports.createGroup = async (req, res) => {
  try {
    const { name, userId } = req.body;

    const group = await Group.create({
      name,
      members: [userId],
      admins: [userId],
      createdBy: userId,
    });

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Group creation failed' });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } }, // Use $addToSet to avoid duplicates
      { new: true } // Return the updated group
    );

    res.json(updatedGroup);     // Return the updated group
  } catch (err) {
    res.status(500).json({ error: 'Failed to join group' });
  }
};
