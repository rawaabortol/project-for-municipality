import express from 'express';
import { getClusters, triggerClusterDetection } from '../controller/clusterController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { isOfficerOrAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getClusters);
router.post('/detect', verifyAuth, isOfficerOrAdmin, triggerClusterDetection);

export default router;
