import {  
  createDonationService,
  getDonorDonationsService,
  getCaseDonationsSummaryService
} from '../services/donation.service.js';

/** Create donation (donor_id comes from JWT) */
export const createDonation = async (req, res) => {
  try {
    const donor_id = req.user.donor_id; // <-- from token
    const { case_id, amount } = req.body;

    const result = await createDonationService({ donor_id, case_id, amount });

    res.status(201).json({
      message: 'Donation successful, invoice sent to email',
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/** Donor donation history */
export const getDonorDonations = async (req, res) => {
  try {
    const donor_id = req.user.user_id; // from token
    const result = await getDonorDonationsService(donor_id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/** Case donation summary */
export const getCaseDonationsSummary = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const result = await getCaseDonationsSummaryService(caseId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
