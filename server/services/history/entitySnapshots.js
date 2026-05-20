const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
};

const toChallengeSnapshot = (challengeDoc) => {
  if (!challengeDoc) return null;

  const source = typeof challengeDoc.toObject === 'function'
    ? challengeDoc.toObject({ depopulate: true })
    : challengeDoc;

  return {
    _id: normalizeId(source._id),
    title: source.title,
    description: source.description,
    difficulty: source.difficulty,
    points: source.points,
    category: source.category,
    createdAt: source.createdAt || null,
  };
};

const toSubmissionSnapshot = (submissionDoc) => {
  if (!submissionDoc) return null;

  const source = typeof submissionDoc.toObject === 'function'
    ? submissionDoc.toObject({ depopulate: true })
    : submissionDoc;

  return {
    _id: normalizeId(source._id),
    challengeId: normalizeId(source.challengeId),
    userId: normalizeId(source.userId),
    repositoryUrl: source.repositoryUrl || null,
    code: source.code || null,
    language: source.language || null,
    status: source.status,
    reviewNotes: source.reviewNotes || null,
    reviewedBy: normalizeId(source.reviewedBy),
    reviewedAt: source.reviewedAt || null,
    submittedAt: source.submittedAt || null,
  };
};

module.exports = {
  toChallengeSnapshot,
  toSubmissionSnapshot,
};
