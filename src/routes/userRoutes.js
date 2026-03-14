const express = require('express');
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/:id', UserController.getById);
router.post('/', UserController.store);
router.post('/token', AuthController.createToken);

// Protected routes
router.put('/:id', authMiddleware, UserController.update);
router.delete('/:id', authMiddleware, UserController.delete);

module.exports = router;
