require('dotenv').config();
const mongoose = require('mongoose');
const Submission = require('./src/features/submissions/Submission.model');
const XpLog = require('./src/features/users/XpLog.model');
const Challenge = require('./src/features/challenges/Challenge.model');

async function backfillXpLog() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');
  
  const uniqueSubs = await Submission.aggregate([
    { $match: { status: 'Accepted' } },
    { $sort: { submittedAt: 1 } },
    {
      $group: {
        _id: { userId: '$userId', challengeId: '$challengeId' },
        submission: { $first: '$$ROOT' }
      }
    }
  ]);
  
  for (const group of uniqueSubs) {
    const sub = group.submission;
    const challenge = await Challenge.findById(sub.challengeId);
    if (challenge) {
      await XpLog.create({
        userId: sub.userId,
        amount: challenge.points,
        reason: 'Challenge Accepted',
        challengeId: sub.challengeId,
        createdAt: sub.submittedAt || sub.createdAt || new Date()
      });
    }
  }
  
  console.log(`Done. Backfilled ${uniqueSubs.length} XpLogs.`);
  process.exit(0);
}

backfillXpLog().catch(err => {
  console.error(err);
  process.exit(1);
});
