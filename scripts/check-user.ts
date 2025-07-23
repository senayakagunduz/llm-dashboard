import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import User from '../models/User';

async function checkUser() {
  try {
    await connectDB();
    const user = await User.findOne({ email: 'admin@arcelik.com' });
    console.log('User found:', user);
  } catch (error) {
    console.error('Error checking user:', error);
  }
}

checkUser();
