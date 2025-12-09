import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const generateToken = (user, expiresIn = '7d') => {
  return jwt.sign(
    {
      user_id: user.user_id, // required
      role: user.role
    },
    JWT_SECRET,
    { expiresIn }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
