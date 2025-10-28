// src/controllers/sponsorships.controller.js
import { db } from '../config/db.js';
import { createCrudController } from './crud.controller.js';

// Basic CRUD for Sponsorships
export const sponsorshipsController = createCrudController(
  'Sponsorships',
  'sponsorship_id',
  ['ngo_id', 'case_id', 'contribution_amount', 'status', 'sponsorship_date']
);

// Override the `create` method to update the case's raised_amount
const originalCreate = sponsorshipsController.create;

sponsorshipsController.create = async (req, res) => {
  try {
    // Ensure contribution_amount is a number
    const contribution = parseFloat(req.body.contribution_amount);
    if (isNaN(contribution) || contribution <= 0) {
      return res.status(400).json({ error: 'Invalid contribution_amount' });
    }

    // 1️⃣ Create the sponsorship record
    const sponsorship = await new Promise((resolve, reject) => {
      const reqClone = { ...req };
      reqClone.body = { 
        ...req.body, 
        status: req.body.status || 'active', 
        sponsorship_date: req.body.sponsorship_date || new Date() 
      };
      originalCreate(reqClone, {
        status: (code) => ({ json: (data) => resolve(data) }),
        json: (data) => resolve(data)
      });
    });

    // 2️⃣ Update the corresponding case's raised_amount
    const [caseRows] = await db.query(
      'SELECT target_amount, raised_amount FROM Cases WHERE case_id = ?',
      [req.body.case_id]
    );

    if (caseRows.length === 0) return res.status(404).json({ error: 'Case not found' });

    let { target_amount, raised_amount } = caseRows[0];
    // Convert to numbers in case DB returns strings
    raised_amount = parseFloat(raised_amount) || 0;
    target_amount = parseFloat(target_amount) || 0;

    raised_amount += contribution;

    // 3️⃣ Determine new status
    const newStatus = raised_amount >= target_amount ? 'completed' : 'in_progress';

    await db.query(
      'UPDATE Cases SET raised_amount = ?, status = ? WHERE case_id = ?',
      [raised_amount, newStatus, req.body.case_id]
    );

    res.status(201).json({ 
      ...sponsorship, 
      updated_case: { raised_amount, status: newStatus } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating sponsorship and updating case' });
  }
};
