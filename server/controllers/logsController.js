const Log = require('../models/Log');

exports.logCity = async (req, res) => {
  try {
    const { city, timestamp } = req.body;
    
    console.log(`City selected: ${city} at ${timestamp}`);
    
    const newLog = new Log({ city, timestamp });
    await newLog.save();
    
    res.status(200).json({ message: 'Logged successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};