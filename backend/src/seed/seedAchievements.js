require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Achievement = require("../models/Achievement");
const achievementCatalog = require("../achievements/catalog");

const seedAchievements = async () => {
  try {
    await connectDB();
    await Promise.all(
      achievementCatalog.map((achievement) =>
        Achievement.updateOne(
          { key: achievement.key },
          { $set: achievement },
          { upsert: true }
        )
      )
    );
    console.log("Achievement catalog up to date.");
  } catch (error) {
    console.error("Achievement seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedAchievements();
