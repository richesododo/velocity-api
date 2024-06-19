const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Controllers
const userController = require("./controllers/userController");
const itemController = require("./controllers/itemController");
const cartController = require("./controllers/cartController");
const orderController = require("./controllers/orderController");

// Initialize the app
const app = express();
const PORT = 5500;

// Configure CORS properly
const corsOptions = {
  origin: "http://localhost:3000", // Adjust if your React app is on a different port
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // Allow cookies/session information to be sent between sites
  allowedHeaders: ["Content-Type", "Authorization"], // Include Authorization header
};
app.use(cors(corsOptions)); // Apply CORS middleware with options

const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_jwt_secret"; // Ensure your environment variable is loaded

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

// Connect to MongoDB atlas
mongoose
  .connect(
    "mongodb+srv://richesododo:velocity-mongodb@velocity.cvkrv39.mongodb.net/velocity?retryWrites=true&w=majority&appName=velocity",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB...");
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB...", err);
  });

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
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
