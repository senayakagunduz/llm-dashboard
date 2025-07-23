import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();

  await connectDB();

  const { userId, adminEmail } = req.body;

  // Basit admin kontrolü
  const admin = await User.findOne({ email: adminEmail, role: 'admin' });
  if (!admin) return res.status(403).json({ message: 'Only admins can delete users' });

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
}
