import { createDonationService } from '../services/donation.service.js';

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
