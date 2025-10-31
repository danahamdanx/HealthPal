// src/controllers/sponsorships.controller.js
import { db } from '../config/db.js';
import { createCrudController } from './crud.controller.js';

// Basic CRUD for Sponsorships
export const sponsorshipsController = createCrudController(
  'Sponsorships',
  'sponsorship_id',
  ['ngo_id', 'case_id', 'contribution_amount', 'status', 'sponsorship_date']
);

// Override the `create` method to update both the case and sponsorship status
const originalCreate = sponsorshipsController.create;

sponsorshipsController.create = async (req, res) => {
  try {
    const contribution = parseFloat(req.body.contribution_amount);
    if (isNaN(contribution) || contribution <= 0) {
      return res.status(400).json({ error: 'Invalid contribution_amount' });
    }

    // 1️⃣ Fetch the case to check target
    const [caseRows] = await db.query(
      'SELECT target_amount, raised_amount FROM Cases WHERE case_id = ?',
      [req.body.case_id]
    );
    if (caseRows.length === 0) return res.status(404).json({ error: 'Case not found' });

    let { target_amount, raised_amount } = caseRows[0];
    raised_amount = parseFloat(raised_amount) || 0;
    target_amount = parseFloat(target_amount) || 0;

    // 2️⃣ Determine sponsorship status
    let sponsorshipStatus = 'active';
    if (contribution + raised_amount >= target_amount) {
      sponsorshipStatus = 'completed';
    }

    // Add calculated status to body before creating
    const reqClone = { ...req, body: { ...req.body, status: sponsorshipStatus } };

    // 3️⃣ Create the sponsorship
    const sponsorship = await new Promise((resolve) => {
      originalCreate(reqClone, {
        status: (code) => ({ json: (data) => resolve(data) }),
        json: (data) => resolve(data)
      });
    });

    // 4️⃣ Update case raised_amount and status
    raised_amount += contribution;
    const caseStatus = raised_amount >= target_amount ? 'completed' : 'in_progress';

    await db.query(
      'UPDATE Cases SET raised_amount = ?, status = ? WHERE case_id = ?',
      [raised_amount, caseStatus, req.body.case_id]
    );

    res.status(201).json({ ...sponsorship, updated_case: { raised_amount, status: caseStatus } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating sponsorship and updating case' });
  }
};
