import express from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User } from "../models/User.js";
import cookieParser from 'cookie-parser'


const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashpassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashpassword });
  await newUser.save();
  res.json({ status: true, message: "User created successfully" });
});

router.post('/login', async (req, res) => {
  // console.log("JWT Secret Key:", process.env.KEY); // Add this line before using the key
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.KEY, { expiresIn: '1h' });
    // console.log("Generated Token:", token); // Log the token for debugging
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour in milliseconds
    return res.json({ status: true, message: "Logged in successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.KEY, { expiresIn: '5m' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sai.venkatasuryavenu2021@vitstudent.ac.in',
        pass: 'jiqmzkmdnyzqucdg'
      }
    });

    const mailOptions = {
      from: 'sai.venkatasuryavenu2021@vitstudent.ac.in',
      to: email,
      subject: 'Reset Password',
      text: `http://localhost:5173/resetPassword/${token}`
    };

    await transporter.sendMail(mailOptions);
    return res.json({ status: true, message: "Email sent" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.KEY);
    const userId = decoded.userId;

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return res.json({ status: true, message: "Password updated" });
  } catch (err) {
    console.error(err);
    return res.json({ message: "Invalid Token" });
  }
});

const verifyUser = async (req, res, next) => {
  try {
    const token = await req.cookies.token;
    if (!token) {
      return res.json({ status: false, message: 'No token' });
    }

    const decoded = await jwt.verify(token, process.env.KEY);
    next();
  } catch (err) {
    return res.json(err);
  }
};

router.get( "/verify", verifyUser, (req, res) => {
  return res.json({ status: true, message: 'Authorized' });
});

router.get('/logout',(req,res) => {
  res.clearCookie('token');
  return res.json({ status: true, message: 'Logged out' });
})

export { router as UserRouter };
