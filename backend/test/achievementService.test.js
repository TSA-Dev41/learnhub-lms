const test = require("node:test");
const assert = require("node:assert/strict");
const { createAchievementService } = require("../src/services/achievementService");

const makeService = ({ updateOne = async () => ({ upsertedCount: 1 }) } = {}) => {
  const achievement = { _id: "achievement-id", key: "first_lesson" };
  const service = createAchievementService({
    Achievement: {
      findOne: async () => achievement,
    },
    UserAchievement: { updateOne },
  });

  return { achievement, service };
};

test("awards an achievement only when a new user award is inserted", async () => {
  const results = [{ upsertedCount: 1 }, { upsertedCount: 0 }];
  const { achievement, service } = makeService({
    updateOne: async () => results.shift(),
  });

  const firstAward = await service.awardAchievement("user-id", "first_lesson");
  assert.equal(firstAward.id, achievement._id);
  assert.equal(firstAward.key, achievement.key);
  assert.equal(
    await service.awardAchievement("user-id", "first_lesson"),
    null
  );
});

test("treats a concurrent duplicate award as already earned", async () => {
  const { service } = makeService({
    updateOne: async () => {
      const error = new Error("Duplicate award");
      error.code = 11000;
      throw error;
    },
  });

  assert.equal(
    await service.awardAchievement("user-id", "first_lesson"),
    null
  );
});

test("surfaces errors other than duplicate awards", async () => {
  const databaseError = new Error("Database unavailable");
  const { service } = makeService({
    updateOne: async () => {
      throw databaseError;
    },
  });

  await assert.rejects(
    service.awardAchievement("user-id", "first_lesson"),
    databaseError
  );
});

test("fails explicitly when an achievement key is not configured", async () => {
  const service = createAchievementService({
    Achievement: { findOne: async () => null },
    UserAchievement: { updateOne: async () => ({ upsertedCount: 1 }) },
  });

  await assert.rejects(
    service.awardAchievement("user-id", "unknown"),
    /Achievement definition not found/
  );
});
