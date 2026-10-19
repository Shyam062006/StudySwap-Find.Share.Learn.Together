'use strict';

const { getDb } = require('../config/database');
const { getUserTotalPoints } = require('../models/ContributionTransaction');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/leaderboard
 * Public. Aggregate all active students by total contribution points.
 * Returns: [{ _id, rank, name, college, branch, semester, contributionPoints, badges[] }]
 */
async function getLeaderboard(req, res, next) {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    // Fetch all active students
    const students = await db.collection('users')
      .find({ isActive: { $ne: false }, role: 'student' })
      .toArray();

    // Map each student to their accurate total points and badges
    const ranked = await Promise.all(
      students.map(async (u) => {
        const txPoints = await getUserTotalPoints(db, u._id);
        const total = Math.max(txPoints || 0, u.contributionPoints || 0);

        // Keep user document in sync
        if (u.contributionPoints !== total) {
          await db.collection('users').updateOne(
            { _id: u._id },
            { $set: { contributionPoints: total } }
          ).catch(() => {});
        }

        return {
          _id: u._id,
          userId: u._id,
          name: u.name,
          college: u.college || 'Engineering College',
          branch: u.branch || 'CSE',
          semester: u.semester || 5,
          contributionPoints: total,
          totalPoints: total,
        };
      })
    );

    // Sort descending by points (highest first)
    ranked.sort((a, b) => b.contributionPoints - a.contributionPoints);

    // Assign 1-based ranks
    const result = ranked.slice(0, limit).map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return ApiResponse.success(res, 200, 'Leaderboard fetched.', result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeaderboard };
