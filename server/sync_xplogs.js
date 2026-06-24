require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/features/users/User.model');
const XpLog = require('./src/features/users/XpLog.model');

async function syncXpLogs() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');
  
  const users = await User.find();
  for (const user of users) {
    const logs = await XpLog.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const loggedPoints = logs.length > 0 ? logs[0].total : 0;
    const actualPoints = user.points || 0;
    
    if (actualPoints > loggedPoints) {
      const diff = actualPoints - loggedPoints;
      // The backfill script didn't log historical Daily Logins.
      // So we add the missing points as a Daily Login entry.
      await XpLog.create({
        userId: user._id,
        amount: diff,
        reason: 'Daily Login',
        createdAt: new Date() // Treat it as earned today so it shows on 7d/30d
      });
      console.log(`Added missing ${diff} XP to ${user.username} as Daily Login`);
    } else if (actualPoints < loggedPoints) {
      console.log(`Warning: ${user.username} has less points in profile (${actualPoints}) than logs (${loggedPoints})`);
    }
  }
  console.log('Done.');
  process.exit(0);
}

syncXpLogs().catch(console.error);
