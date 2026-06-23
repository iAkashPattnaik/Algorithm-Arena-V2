const User = require('../src/features/users/User.model');

/**
 * Computes the global rank of a single user efficiently by counting users with more points.
 *
 * @param {mongoose.Types.ObjectId|string} userId
 * @returns {Promise<number|null>} 1-based rank, or null if user not found.
 */
const getUserRank = async (userId) => {
  const targetUser = await User.findById(userId).select('points solvedProblems');
  if (!targetUser) return null;

  const strictHigherRankedCount = await User.countDocuments({
    role: { $ne: 'superAdmin' },
    $or: [
      { points: { $gt: targetUser.points } },
      { points: targetUser.points, solvedProblems: { $gt: targetUser.solvedProblems || 0 } },
      { points: targetUser.points, solvedProblems: targetUser.solvedProblems || 0, _id: { $lt: targetUser._id } }
    ]
  });

  const strictRank = strictHigherRankedCount + 1;

  if (strictRank <= 3) {
    return strictRank;
  }

  // If > 3, they share rank with anyone who has the same points, but minimum rank is 4
  const strictlyGreaterPointsCount = await User.countDocuments({
    role: { $ne: 'superAdmin' },
    points: { $gt: targetUser.points }
  });

  const firstPersonRank = strictlyGreaterPointsCount + 1;
  return Math.max(4, firstPersonRank);
};

module.exports = { getUserRank };