const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createSession = (user) => ({
  token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
  user: { id: user._id, name: user.name, email: user.email },
});

exports.register = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
    });

    res.status(201).json(createSession(user));
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to create account." });
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    res.json(createSession(user));
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to sign in." });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
