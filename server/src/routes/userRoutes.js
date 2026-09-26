import express from 'express';
import { getUsers, updateUserRole } from '../controller/userController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { isAdminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', verifyAuth, isAdminOnly, getUsers);
router.put('/:id/role', verifyAuth, isAdminOnly, updateUserRole);

export default router;
