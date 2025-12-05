import express from "express";
import {
  createHealthWorkshop,
  getAllHealthWorkshops,
  getSingleWorkshop,
  registerForWorkshop,
  getWorkshopParticipants,
  getMyWorkshops
} from "../controllers/healthWorkshops.controller.js";

import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.middleware.js";

const router = express.Router();

/*  
  Workshops Routes  
*/

// Create workshop (Admins only)
router.post(
  "/workshops",
  authenticate,
  authorize("admin"),
  createHealthWorkshop
);

// Get all workshops (public)
router.get(
  "/workshops",
  getAllHealthWorkshops
);

// Get single workshop info
router.get(
  "/workshops/:id",
  getSingleWorkshop
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
  authorize("admin"),
  getWorkshopParticipants
);

// Get workshops the current user is registered in
router.get(
  "/my-workshops",
  authenticate,
  getMyWorkshops
);

export default router;
