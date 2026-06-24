require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/features/users/User.model');

async function fixTodayXP() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const result = await User.updateMany(
    { 
      lastLoginDate: { $gte: today },
      createdAt: { $gte: today }
    },
    {
      $set: { lastLoginDate: yesterday }
    }
  );
  
  console.log(`Reset lastLoginDate for ${result.modifiedCount} newly created users.`);
  console.log('They will now receive their Daily 50 XP when they log in next.');
  process.exit(0);
}

fixTodayXP().catch(console.error);
