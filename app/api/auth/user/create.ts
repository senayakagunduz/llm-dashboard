import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();

  const { email, name, password, role, adminEmail } = req.body;

  // Basit admin kontrolü
  const admin = await User.findOne({ email: adminEmail, role: 'admin' });
  if (!admin) return res.status(403).json({ message: 'Only admins can create users' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const newUser = new User({ email, name, password, role: role || 'user' });
    await newUser.save();

    res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
