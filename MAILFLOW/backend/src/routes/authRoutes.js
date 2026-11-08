import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || !process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Admin login is not configured on the server.' });
  }
  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, admin: { email } });
});

export default router;
