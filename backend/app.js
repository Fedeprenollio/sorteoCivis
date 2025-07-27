import express from 'express';
import cors from 'cors';
import civRoutes from './routes/civRoutes.js';
import morgan from 'morgan';

const app = express();
app.use(morgan('dev'));

app.use(cors());
app.use(express.json());

// Usamos rutas bajo /api/civs
app.use('/api/civs', civRoutes);

export default app;
