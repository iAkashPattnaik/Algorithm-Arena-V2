require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/features/users/User.model');
const Submission = require('./src/features/submissions/Submission.model');
const Challenge = require('./src/features/challenges/Challenge.model');

async function fixPoints() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');
  
  const users = await User.find();
  for (const u of users) {
    const acceptedSubs = await Submission.find({ userId: u._id, status: 'Accepted' })
      .populate('challengeId', 'points');
      
    let totalPoints = 0;
    const uniqueChallengeIds = new Set();
    
    for (const sub of acceptedSubs) {
      if (sub.challengeId && !uniqueChallengeIds.has(sub.challengeId._id.toString())) {
        uniqueChallengeIds.add(sub.challengeId._id.toString());
        totalPoints += sub.challengeId.points || 0;
      }
    }
    
    if (u.points !== totalPoints || u.solvedProblems !== uniqueChallengeIds.size) {
      console.log(`Fixing ${u.username}: solved ${u.solvedProblems}->${uniqueChallengeIds.size}, points ${u.points}->${totalPoints}`);
      u.solvedProblems = uniqueChallengeIds.size;
      u.points = totalPoints;
      await u.save({ validateModifiedOnly: true });
    }
  }
  
  console.log('Done.');
  process.exit(0);
}

fixPoints().catch(console.error);
