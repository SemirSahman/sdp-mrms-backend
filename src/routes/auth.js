const express = require('express');
const ctrl = require('../controllers/authController');
const router = express.Router();

router.post('/seed', async (req, res) => {
  try {
    const seedKey = req.headers['x-seed-key'];
    if (seedKey !== process.env.SEED_KEY) {
      return res.status(403).json({ message: 'Unauthorized: Invalid seed key' });
    }
    
    const { seed } = require('../seed');
    await seed();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
module.exports = router;
