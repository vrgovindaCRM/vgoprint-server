const userModel = require("../models/user.model");


const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).send({ error: 'Access denied' });
    }
    next();
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
};

module.exports = isAdmin;
