import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getConfig, upsertConfig, patchArticle, removeRating } from '../controllers/adminController';
import { getUsers, updateUser } from '../controllers/userController';

const router = express.Router();

// First, authenticate all requests to this router
router.use(authenticate);
// Then, ensure only admins can access them
router.use(authorize('admin'));

// User Management Routes
router.get('/users', getUsers);
router.put('/users/:userId', updateUser);

// System Configuration Routes
router.get('/config', getConfig);
router.put('/config', upsertConfig);

// Article Management Routes
router.patch('/articles/:idOrDoi', patchArticle);
router.delete('/articles/:id/ratings', removeRating);

export default router;