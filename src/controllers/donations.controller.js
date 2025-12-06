import { db } from '../config/db.js';
import { generateDonationInvoice } from '../utils/pdfGenerator.js';


export const createDonation = async (req, res) => {
  try {
    const { donor_id, case_id, amount } = req.body;

    if (!donor_id || !case_id || !amount)
      return res.status(400).json({ error: 'Missing required fields' });

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0)
      return res.status(400).json({ error: 'Invalid donation amount' });

    // ✅ Check that case is verified (active)
    const [caseRows] = await db.query('SELECT target_amount, raised_amount, verified, status FROM Cases WHERE case_id = ?', [case_id]);
    if (!caseRows.length) return res.status(404).json({ error: 'Case not found' });

   const caseData = caseRows[0];
if (!caseData.verified || caseData.status === 'pending_verification') {
  return res.status(400).json({ error: 'Case not verified yet' });
}


    // ✅ Insert donation
    await db.query(
      `INSERT INTO Donations (donor_id, case_id, amount) VALUES (?, ?, ?)`,
      [donor_id, case_id, donationAmount]
    );

    // ✅ Update case raised_amount
    const newRaised = parseFloat(caseData.raised_amount || 0) + donationAmount;
    const newStatus = newRaised >= caseData.target_amount ? 'completed' : 'in_progress';

    await db.query(
      `UPDATE Cases SET raised_amount = ?, status = ? WHERE case_id = ?`,
      [newRaised, newStatus, case_id]
    );
    
  // Update donor's total donated
    await db.query(
      `UPDATE Donors SET total_donated = total_donated + ? WHERE donor_id = ?`,
      [donationAmount, donor_id]
    );
    // Fetch donor & case info for the invoice
    const [donorRows] = await db.query('SELECT name, email FROM Donors WHERE donor_id = ?', [donor_id]);
    const donor = donorRows[0];

    const [caseRows2] = await db.query('SELECT title FROM Cases WHERE case_id = ?', [case_id]);
    // Generate PDF invoice
    const pdfPath = await generateDonationInvoice({
      donorName: donor.name,
      caseTitle: caseData.title,
      amount: donationAmount,
      date: new Date().toLocaleDateString()
    });

    res.status(201).json({
      message: 'Donation successful',
      updated_case: {
        case_id,
        raised_amount: newRaised,
        status: newStatus
      },
      invoice: pdfPath
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing donation' });
  }
};
  
