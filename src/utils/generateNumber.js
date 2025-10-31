const countModel = require('../models/counter.model');

async function generateUserNumber(stateCode) {

  const counter = await countModel.findOneAndUpdate(
    { stateCode },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const countStr = String(counter.count).padStart(4, '0');
  return `${stateCode}-VR-${countStr}`;
}

module.exports = generateUserNumber;
