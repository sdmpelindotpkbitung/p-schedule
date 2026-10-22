const express = require('express');
const router = express.Router();
const tvController = require('../controllers/tvController');
const { verifyToken } = require('../middleware/authMiddleware');

// Endpoint untuk TV (Publik, tidak perlu verifyToken)
router.get('/slides', tvController.getSlides);

// Endpoint untuk Admin (Butuh login)
router.post('/slides', verifyToken, tvController.uploadSlide);
router.delete('/slides/:id', verifyToken, tvController.deleteSlide);

module.exports = router;