const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_jwt_secret"; // This should be in an environment variable
const JWT_EXPIRES_IN = "90d"; // Adjust according to your needs

exports.signup = async (req, res) => {
  const { email, password, name, postCode, address } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      postCode,
      address,
    });
    const result = await user.save();

    // Create a token
    const token = jwt.sign({ userId: result._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res
      .status(201)
      .json({ userId: result._id, token, message: "User created!" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({ userId: user._id, token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};
