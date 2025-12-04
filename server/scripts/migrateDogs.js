const mongoose = require('mongoose');
const Dog = require('../models/Dog');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await Dog.updateMany(
      { $or: [{ breeder: { $exists: false } }, { breeder: null }] },
      [
        { $set: { breeder: "$owner" } }
      ]
    );

    console.log("Updated dogs:", result);
    await mongoose.connection.close();
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
})();
