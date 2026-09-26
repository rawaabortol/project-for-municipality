import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import investigationRoutes from './src/routes/investigationRoutes.js';
import alertRoutes from './src/routes/alertRoutes.js';
import clusterRoutes from './src/routes/clusterRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/clusters', clusterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'Tripoli Smart Public Health Surveillance & Reporting Server',
    city: 'Tripoli, Lebanon',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[Tripoli HealthPulse Server] Running on port ${PORT}`);
  });
}

export default app;
