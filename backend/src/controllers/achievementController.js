const Achievement = require("../models/Achievement");
const {
  getUserAchievements,
  toAchievementSummary,
} = require("../services/achievementService");
const asyncHandler = require("../utils/asyncHandler");

exports.getAchievements = asyncHandler(async (req, res) => {
  const achievements = await Achievement.find().sort({ points: 1, name: 1 });

  res.status(200).json({
    success: true,
    message: "Achievements retrieved successfully",
    data: achievements.map(toAchievementSummary),
  });
});

exports.getMyAchievements = asyncHandler(async (req, res) => {
  const awards = await getUserAchievements(req.user._id);
  const achievements = awards.map((award) => ({
    id: award.achievement._id,
    key: award.achievement.key,
    name: award.achievement.name,
    description: award.achievement.description,
    points: award.achievement.points,
    awardedAt: award.awardedAt,
    metadata: award.metadata,
  }));

  res.status(200).json({
    success: true,
    message: "Your achievements retrieved successfully",
    data: {
      achievements,
      totalPoints: achievements.reduce(
        (total, achievement) => total + achievement.points,
        0
      ),
    },
  });
});
