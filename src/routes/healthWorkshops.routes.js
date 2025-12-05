import express from "express";
import { db } from "../config/db.js";

import {
  createHealthWorkshop,
  getHealthWorkshops,
  registerForWorkshop,
  getWorkshopParticipants,
  getMyWorkshops
} from "../controllers/healthWorkshops.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
const router = express.Router();

/*  
  Workshops Routes  
*/

// Create workshop (Admins only)
router.post(
  "/workshops",
  authenticate,
  authorizeRoles("admin","ngo"),
  createHealthWorkshop
);

// Get all workshops (public)
router.get(
  "/workshops",
  getHealthWorkshops
);



// Register user in workshop
router.post(
  "/workshops/:id/register",
  authenticate,
  registerForWorkshop
);

// Get participants of a workshop (Admins only)
router.get(
  "/workshops/:id/participants",
  authenticate,
  authorizeRoles("admin"),
getWorkshopParticipants);

// Get workshops the current user is registered in
router.get(
  "/my-workshops",
  authenticate,
  getMyWorkshops
);

export default router;
