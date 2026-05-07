const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
initializeApp();
const Razorpay = require("razorpay");
const admin = require("firebase-admin");
const twilio = require("twilio");
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


// Send OTP
exports.sendOtp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.log("Send OTP function triggered");

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { phone } = req.body;
    if (!phone) {
      return res.status(400).send("Phone number required");
    }

    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const verifySid = process.env.TWILIO_VERIFY_SID;

      const client = twilio(accountSid, authToken);
      const verification = await client.verify.v2.services(verifySid)
        .verifications.create({ to: phone, channel: "sms" });
console.log("OTP response sending...");

      return res.status(200).json({ success: true, status: verification.status });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});

exports.verifyOtp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.log("Verify OTP function triggered");

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).send("Phone and code required");
    }

    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const verifySid = process.env.TWILIO_VERIFY_SID;

      if (!accountSid || !authToken || !verifySid) {
        throw new Error("Twilio configuration missing");
      }

      const client = twilio(accountSid, authToken);
      const verification_check = await client.verify.v2.services(verifySid)
        .verificationChecks.create({ to: phone, code });

      console.log("Verification result:", verification_check.status);

      if (verification_check.status !== "approved") {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }

      //  Create or get user in Firebase Auth
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByPhoneNumber(phone);
        console.log("Existing user found:", userRecord.uid);
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          userRecord = await admin.auth().createUser({ phoneNumber: phone });
          console.log("New user created:", userRecord.uid);
        } else {
          throw error;
        }
      }

      //  Return UID to frontend
      // return res.status(200).json({
      //   success: true,
      //   status: verification_check.status,
      //   uid: userRecord.uid,
      // });
// Create a Firebase Custom Token for frontend login
const customToken = await admin.auth().createCustomToken(userRecord.uid);
console.log("Custom token created:", customToken ? "yes" : "no");

return res.status(200).json({
  success: true,
  status: verification_check.status,
  uid: userRecord.uid,
  token: customToken,
});

    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
});
