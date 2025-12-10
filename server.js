import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './src/config/db.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Load Swagger YAML

import userRoutes from './src/routes/users.routes.js';
import patientRoutes from './src/routes/patients.routes.js';
import doctorRoutes from './src/routes/doctors.routes.js';
import ngoRoutes from './src/routes/ngo.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import consultationsRoutes from "./src/routes/consultations.routes.js";
import casesRoutes from './src/routes/cases.routes.js';
import sponsorshipsRoutes from './src/routes/sponsorships.routes.js'
import donorRoutes from './src/routes/donors.routes.js'
import donationRoutes from './src/routes/donation.routes.js'
import medicalrequest from './src/routes/medicalRequests.routes.js'
import equipmentInventory from './src/routes/equipmentInventory.routes.js'
import equipmentRequests from './src/routes/equipmentRequests.routes.js'
import therapyRoutes from "./src/routes/therapy.routes.js";
import healthEducationRoutes from "./src/routes/healthEducation.routes.js";
import externalHealthRoutes from "./src/routes/externalHealth.routes.js";
import workshopRoutes from "./src/routes/healthWorkshops.routes.js";
import dashboardRoutes from './src/routes/dashboard.routes.js';
import ngoReportsRoutes from './src/routes/ngoReports.routes.js';




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger UI setup
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/users', userRoutes);
// New patients routes 
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/consultations", consultationsRoutes);
app.use("/api/cases",casesRoutes);
app.use("/api/sponsorships",sponsorshipsRoutes);
app.use("/api/donors",donorRoutes);
app.use("/api/donations",donationRoutes);
app.use("/api/medical-requests",medicalrequest);
app.use("/api/equipment-Inventory",equipmentInventory);
app.use("/api/equipment-Requests",equipmentRequests);
app.use("/api/therapy", therapyRoutes);
app.use("/api/health_alert",healthEducationRoutes);
app.use("/api/external_health_article", externalHealthRoutes);
app.use("/api", workshopRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ngos', ngoReportsRoutes);

 




// Test DB connection
db.getConnection()
  .then(() => console.log('✅ Connected to MySQL'))
  .catch(err => console.error('❌ Database connection failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




