import express from 'express';
import { getStatistics } from '../controller/dashboardController.js';

const router = express.Router();
router.get('/statistics', getStatistics);

export default router;
