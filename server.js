import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './src/config/db.js';
import userRoutes from './src/routes/users.routes.js';
import patientRoutes from './src/routes/patients.routes.js';
import doctorRoutes from './src/routes/doctors.routes.js';
import ngoRoutes from './src/routes/ngo.routes.js';




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
// New patients routes 
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/ngos', ngoRoutes);



// Test DB connection
db.getConnection()
  .then(() => console.log('✅ Connected to MySQL'))
  .catch(err => console.error('❌ Database connection failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




