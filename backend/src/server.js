import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import appRoutes from './routes/apps/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// Public & authentication endpoints
app.use('/api/auth', authRoutes);

// Protected sub-application API endpoints
app.use('/api/apps', appRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Aleph backend running on port ${PORT}`));