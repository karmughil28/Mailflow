import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';
import campaignRoutes from './src/routes/campaignRoutes.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(v => v.trim()),
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use('/api/campaigns', rateLimit({ windowMs: 60 * 1000, limit: 10 }), campaignRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'MAILFLOW API' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`MAILFLOW API running on port ${PORT}`));
  })
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
