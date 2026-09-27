import express from "express";
import { getStatistics } from "../controller/dashboard.controller.js";

const router = express.Router();

router.get("/statistics", getStatistics);

export default router;
