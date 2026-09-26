import express from 'express';
import { getReports, createReport, updateReportStatus } from '../controller/reportController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { isOfficerOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getReports);
router.post('/', verifyAuth, createReport);
router.put('/:id/status', verifyAuth, isOfficerOrAdmin, updateReportStatus);

export default router;
