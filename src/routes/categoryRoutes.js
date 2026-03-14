const express = require('express');
const CategoryController = require('../controllers/CategoryController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/search', CategoryController.search);
router.get('/:id', CategoryController.getById);

// Protected routes
router.post('/', authMiddleware, CategoryController.store);
router.put('/:id', authMiddleware, CategoryController.update);
router.delete('/:id', authMiddleware, CategoryController.delete);

module.exports = router;
