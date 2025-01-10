// Required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config(); // To load environment variables

// App initialization
const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

const User = mongoose.model('User', userSchema);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MY_EMAIL,   // Add your email here or load from environment variables
        pass: process.env.MY_PASSWORD, // Add your email password or load from environment variables
    },
});

// 1.1 User Registration API
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email or username.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user.', error: error.message });
    }
});

// 1.2 User Login API
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in.', error: error.message });
    }
});

// 1.3 Forgot Password API
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Save token and expiry in DB
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // Send Reset Email
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        const mailOptions = {
            to: email,
            from: process.env.MY_EMAIL, // Use environment variable for the email
            subject: 'Password Reset Request',
            text: `You can reset your password by clicking the following link: ${resetLink}`,
        };

        await transporter.sendMail(mailOptions);
        res.send('Password reset email sent');
    } catch (error) {
        console.error('Error during password reset request:', error.message);
        res.status(500).send('Error while processing request');
    }
});

// 1.4 Reset Password API
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Verify the reset token using the JWT_SECRET from the environment
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if token has expired
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Reset token has expired.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        user.password = hashedPassword;
        user.resetPasswordToken = undefined; // Clear the reset token
        user.resetPasswordExpires = undefined; // Clear the reset token expiry
        await user.save();

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token has expired.' });
        }
        res.status(500).json({ message: 'Error resetting password.', error: error.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
