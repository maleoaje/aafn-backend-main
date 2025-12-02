require("dotenv").config();
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

connectDB();

const updateGoogleOAuth = async () => {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const googleLoginStatus = process.env.GOOGLE_LOGIN_STATUS === "true";

    if (!googleClientId || !googleClientSecret) {
      console.error("Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env file");
      process.exit(1);
    }

    // Update the storeSetting document with Google OAuth credentials
    const result = await Setting.findOneAndUpdate(
      { name: "storeSetting" },
      {
        $set: {
          "setting.google_id": googleClientId,
          "setting.google_secret": googleClientSecret,
          "setting.google_login_status": googleLoginStatus,
        },
      },
      { new: true, upsert: true }
    );

    if (result) {
      console.log("✓ Google OAuth credentials updated successfully!");
      console.log(`  - Google Client ID: ${googleClientId}`);
      console.log(`  - Google Login Status: ${googleLoginStatus}`);
      console.log("✓ Store settings updated in MongoDB");
    } else {
      console.error("Error: Could not update storeSetting");
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error updating Google OAuth settings:", error);
    process.exit(1);
  }
};

// Wait a bit for DB connection, then run the update
setTimeout(() => {
  updateGoogleOAuth();
}, 2000);


