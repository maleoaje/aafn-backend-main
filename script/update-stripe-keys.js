require("dotenv").config();
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

// Replace these with your actual Stripe keys
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_YOUR_PUBLISHABLE_KEY";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_YOUR_SECRET_KEY";

connectDB();

const updateStripeKeys = async () => {
  try {
    const storeSetting = await Setting.findOneAndUpdate(
      { name: "storeSetting" },
      {
        $set: {
          "setting.stripe_key": STRIPE_PUBLISHABLE_KEY,
          "setting.stripe_secret": STRIPE_SECRET_KEY,
          "setting.stripe_status": true,
        },
      },
      { new: true, upsert: true }
    );

    if (storeSetting) {
      console.log("✅ Stripe keys updated successfully!");
      console.log("Publishable Key:", storeSetting.setting.stripe_key);
      console.log("Secret Key:", storeSetting.setting.stripe_secret ? "***hidden***" : "not set");
    } else {
      console.log("❌ Failed to update Stripe keys");
    }
    process.exit();
  } catch (error) {
    console.log("❌ Error updating Stripe keys:", error.message);
    process.exit(1);
  }
};

updateStripeKeys();



