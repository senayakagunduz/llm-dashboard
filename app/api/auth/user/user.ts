import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import IUser from '../../../../models/User';
import User from '../../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await connectDB();

    switch (req.method) {
      case 'GET':
        const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, users });
        break;

      case 'PUT':
        const { userId } = req.query;
        const updateData = req.body;
        
        // Şifre güncelleniyorsa hash'le
        if (updateData.password) {
          const bcrypt = require('bcryptjs');
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          updateData,
          { new: true, select: '-password' }
        );

        if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ success: true, user: updatedUser });
        break;

      case 'DELETE':
        const { userId: deleteUserId } = req.query;
        
        // Soft delete - kullanıcıyı deaktif et
        const deletedUser = await User.findByIdAndUpdate(
          deleteUserId,
          { isActive: false },
          { new: true, select: '-password' }
        );

        if (!deletedUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deactivated' });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}