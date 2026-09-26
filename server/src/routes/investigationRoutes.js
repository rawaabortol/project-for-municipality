import express from 'express';
import { getInvestigations, createInvestigation, updateInvestigation } from '../controller/investigationController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { isOfficerOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getInvestigations);
router.post('/', verifyAuth, isOfficerOrAdmin, createInvestigation);
router.put('/:id', verifyAuth, isOfficerOrAdmin, updateInvestigation);

export default router;
