const Cart = require("../models/Cart");
const mongoose = require("mongoose");

exports.addToCart = async (req, res) => {
  const { itemId, qty } = req.body;
  const userId = req.user.userId;
  console.log(req.user);

  try {
    const existingItem = await Cart.findOne({ userId, itemId, ordered: false });
    if (existingItem) {
      existingItem.qty += qty;
      await existingItem.save();
      return res.status(200).json({ message: "Cart updated successfully" });
    }

    const newItem = new Cart({
      userId,
      itemId,
      qty,
    });
    const result = await newItem.save();
    res.status(201).json({ cartId: result._id, message: "Item added to cart" });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.toString() });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  const { userId, itemId } = req.params;
  const { qty } = req.body; // This should be a delta (change in quantity).

  try {
    const cartItem = await Cart.findOne({ userId, itemId });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    console.log("Original Quantity:", cartItem.qty);
    cartItem.qty += qty;
    console.log("Updated Quantity:", cartItem.qty);

    await cartItem.save();
    res.status(200).json(cartItem);
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res
      .status(500)
      .json({ message: "Failed to update cart item", error: error.toString() });
  }
};

exports.removeFromCart = async (req, res) => {
  const { itemId } = req.body; // Getting itemId from the request body
  const userId = req.user.userId; // Assuming your authentication middleware sets req.user

  try {
    // Find the cart item
    const cartItem = await Cart.findOneAndDelete({
      userId,
      itemId,
      ordered: false,
    });

    // Check if the item exists in the cart
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Send success response
    return res.status(200).json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({
      message: "Error removing item from cart",
      error: error.toString(),
    });
  }
};

exports.showCart = async (req, res) => {
  console.log("USER", req.params);
  const userId = req.params.userId;

  try {
    console.log("userId", userId);
    const cartItems = await Cart.find({ userId, ordered: false }).populate(
      "itemId"
    );
    if (!cartItems.length) {
      return res.status(404).json({ message: "No items in your cart" });
    }
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Retrieve Cart Error:", error);
    res.status(500).json({
      message: "Error retrieving cart items",
      error: error.toString(),
    });
  }
};
