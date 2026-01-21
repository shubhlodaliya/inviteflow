const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const nodemailer = require("nodemailer");
const { generateOTPEmail } = require("../templates/otpEmailTemplate");

// email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =========================
// SEND OTP
// =========================
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Missing EMAIL_USER or EMAIL_PASS environment variables");
      return res.status(500).json({ error: "Email service not configured" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // delete old OTPs
    await pool.query("DELETE FROM email_otps WHERE email = $1", [email]);

    // save new OTP
    await pool.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES ($1,$2,$3)",
      [email, otp, expiresAt]
    );

    // send email with OTP
    const emailHTML = generateOTPEmail(otp);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 InviteFlow - Your OTP Verification Code",
      html: emailHTML,
    });

    console.log(`OTP sent successfully to ${email}`);
    res.json({ message: "OTP sent successfully to your email" });

  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({ error: "Failed to send OTP", details: error.message });
  }
};

// =========================
// SIGNUP WITH OTP
// =========================
exports.signup = async (req, res) => {
  try {
    const { name, email, otp, password } = req.body;

    // verify OTP
    const result = await pool.query(
      "SELECT * FROM email_otps WHERE email=$1 AND otp=$2 AND expires_at > NOW()",
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, email",
      [name, email, hashedPassword]
    );

    // delete OTP after success
    await pool.query("DELETE FROM email_otps WHERE email=$1", [email]);

    res.status(201).json({
      message: "Signup successful",
      user: user.rows[0],
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// =====================
// LOGIN + ACCESS TOKEN
// =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user exists
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 🔐 generate access token
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =========================
// FORGOT PASSWORD - SEND OTP
// =========================
exports.sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User with this email does not exist" });
    }

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Missing EMAIL_USER or EMAIL_PASS environment variables");
      return res.status(500).json({ error: "Email service not configured" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // delete old OTPs
    await pool.query("DELETE FROM email_otps WHERE email = $1", [email]);

    // save new OTP
    await pool.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES ($1,$2,$3)",
      [email, otp, expiresAt]
    );

    // send email with OTP
    const emailHTML = generateOTPEmail(otp);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 InviteFlow - Reset Password OTP",
      html: emailHTML,
    });

    console.log(`Forgot password OTP sent successfully to ${email}`);
    res.json({ message: "OTP sent successfully to your email" });

  } catch (error) {
    console.error("Error sending forgot password OTP:", error.message);
    res.status(500).json({ error: "Failed to send OTP", details: error.message });
  }
};

// =========================
// FORGOT PASSWORD - VERIFY OTP
// =========================
exports.verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // verify OTP
    const result = await pool.query(
      "SELECT * FROM email_otps WHERE email=$1 AND otp=$2 AND expires_at > NOW()",
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    res.json({ 
      message: "OTP verified successfully",
      verified: true 
    });

  } catch (error) {
    console.error("Error verifying forgot password OTP:", error.message);
    res.status(500).json({ error: "Failed to verify OTP", details: error.message });
  }
};

// =========================
// RESET PASSWORD
// =========================
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    // Verify OTP exists and is valid (as a security check)
    const otpResult = await pool.query(
      "SELECT * FROM email_otps WHERE email=$1 AND expires_at > NOW()",
      [email]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: "Please verify OTP first" });
    }

    // Check if user exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    // Delete OTP after successful password reset
    await pool.query("DELETE FROM email_otps WHERE email=$1", [email]);

    res.json({ 
      message: "Password reset successful" 
    });

  } catch (error) {
    console.error("Error resetting password:", error.message);
    res.status(500).json({ error: "Failed to reset password", details: error.message });
  }
};

// =========================
// GET USER (from JWT)
// =========================
exports.getUser = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT secret not configured" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [payload.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return res.status(500).json({ error: "Failed to fetch user", details: error.message });
  }
};
