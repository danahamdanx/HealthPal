import { createDonationService } from '../services/donation.service.js';
import { 
  createDonationService, 
  getDonorDonationsService,
  getCaseDonationsSummaryService
} from '../services/donation.service.js';



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
export const createDonation = async (req, res) => {
  try {
    const result = await createDonationService(req.body);
    res.status(201).json({
      message: 'Donation successful, invoice sent to email',
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
