const express = require("express");
const router = express.Router();

const {
  sendOtp,
  signup,
  login,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  getUser
} = require("../controllers/auth_controller");

router.post("/send-otp", sendOtp);
router.post("/signup", signup);
router.post("/login", login);

// Current user
router.get("/get-user", getUser);

// Forgot Password Routes
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/forgot-password/reset-password", resetPassword);

module.exports = router;
