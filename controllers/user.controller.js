const User = require('../models/user.model');

exports.createOrFindUser = async (req, res) => {
  try {
    const { name, email, photo } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, photo });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'User create/find failed' });
  }
};
