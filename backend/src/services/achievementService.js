const toAchievementSummary = (achievement) => ({
  id: achievement._id,
  key: achievement.key,
  name: achievement.name,
  description: achievement.description,
  points: achievement.points,
});

const createAchievementService = ({ Achievement, UserAchievement }) => ({
  getUserAchievements(userId) {
    return UserAchievement.find({ user: userId })
      .sort({ awardedAt: -1 })
      .populate("achievement", "key name description points");
  },

  async awardAchievement(userId, key, metadata = {}) {
    const achievement = await Achievement.findOne({ key });
    if (!achievement) {
      throw new Error(`Achievement definition not found for key "${key}"`);
    }

    try {
      const result = await UserAchievement.updateOne(
        { user: userId, achievement: achievement._id },
        {
          $setOnInsert: {
            user: userId,
            achievement: achievement._id,
            metadata,
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );

      return result.upsertedCount === 1
        ? toAchievementSummary(achievement)
        : null;
    } catch (error) {
      if (error.code === 11000) return null;
      throw error;
    }
  },
});

module.exports = {
  ...createAchievementService({
    Achievement: require("../models/Achievement"),
    UserAchievement: require("../models/UserAchievement"),
  }),
  createAchievementService,
  toAchievementSummary,
};
