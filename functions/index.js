const functions = require("firebase-functions");
const Razorpay = require("razorpay");
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
