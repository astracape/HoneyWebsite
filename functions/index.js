const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { amount, currency } = req.body;

    try {
      const order = await razorpay.orders.create({
        amount: amount * 100, // in paise
        currency: currency || "INR",
      });
      res.status(200).json(order);
    } catch (err) {
      console.error("Error creating order", err);
      res.status(500).send("Error creating Razorpay order");
    }
  });
});


if (!admin.apps.length) {
  admin.initializeApp();
}

exports.deleteUserCompletelyv2 = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.log("HTTP Function triggered");

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { uid } = req.body;
    console.log(" UID received:", uid);

    if (!uid) {
      return res.status(400).json({ error: "User ID is required." });
    }

    try {
      await admin.auth().deleteUser(uid);
      await admin.firestore().collection("users").doc(uid).delete();
      return res.status(200).json({ success: true });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        await admin.firestore().collection("users").doc(uid).delete();
        return res.status(200).json({ success: true, warning: "User not found in auth" });
      }

      console.error("Deletion failed:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});