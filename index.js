const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Controllers
const userController = require("./controllers/userController");
const itemController = require("./controllers/itemController");
const cartController = require("./controllers/cartController");
const orderController = require("./controllers/orderController");

// Initialize the app
const app = express();

// Configure CORS properly
const corsOptions = {
  origin: "*", // Adjust to your front-end app origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// JWT Authentication Middleware
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
}

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "your_mongodb_connection_string", {
    // useNewUrlParser: true, // Remove these options
    // useUnifiedTopology: true, // Remove these options
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// Routes
app.get("/test", (req, res) => {
  res.json("Hello world");
});
app.post("/signup", userController.signup);
app.post("/login", userController.login);
app.get("/items", itemController.showItems);
app.get("/item/:id", itemController.showItem);
app.get("/items/:category", itemController.getItemsByCategory);
app.post("/cart", authenticateToken, cartController.addToCart);
app.get("/cart/:userId", cartController.showCart);
app.get("/cart", authenticateToken, cartController.showCart);
app.post("/order", orderController.addOrder);
app.delete("/cart", authenticateToken, cartController.removeFromCart);
app.put("/cart/:userId/:itemId", cartController.updateCartItemQuantity);

// Export the app as a module
module.exports = app;
