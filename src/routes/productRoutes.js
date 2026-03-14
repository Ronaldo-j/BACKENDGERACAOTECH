const express = require('express');
const ProductController = require('../controllers/ProductController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/search', ProductController.search);
router.get('/:id', ProductController.getById);

// Protected routes
router.post('/', authMiddleware, ProductController.store);
router.put('/:id', authMiddleware, ProductController.update);
router.delete('/:id', authMiddleware, ProductController.delete);

module.exports = router;
