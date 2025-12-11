import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const generateToken = (user, expiresIn = '7d') => {
  return jwt.sign(
    {
      user_id: user.user_id,   // موجود
      role: user.role,         // موجود
      patient_id: user.patient_id || null,
      doctor_id: user.doctor_id || null,
      donor_id: user.donor_id || null,
      ngo_id: user.ngo_id || null,

    },
    JWT_SECRET,
    { expiresIn }
  );
};


export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
