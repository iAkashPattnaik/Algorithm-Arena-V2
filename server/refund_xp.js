require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/features/users/User.model');

async function refundDailyXP() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');
  
  // Refunding the 50 XP that was lost during the fix_points run
  const usernames = ['USER101', 'nirakarpatel'];
  
  for (const username of usernames) {
    const user = await User.findOne({ username });
    if (user) {
      user.points = (user.points || 0) + 50;
      await user.save();
      console.log(`Refunded 50 XP to ${username}. New points: ${user.points}`);
    }
  }

  console.log('Done.');
  process.exit(0);
}

refundDailyXP().catch(console.error);
