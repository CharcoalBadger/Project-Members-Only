const express = require("express");
const router = express.Router();
const { getAllMessages, createMessage } = require("../models/message");
const {
  ensureAuthenticated,
  ensureMember,
  ensureAdmin,
} = require("../middleware/auth");

const { deleteMessage } = require("../models/message");

// Show all messages on home page
router.get("/", async (req, res) => {
  const messages = await getAllMessages();
  res.render("index", { messages });
});

// Show new message form
router.get("/new-message", ensureAuthenticated, ensureMember, (req, res) => {
  res.render("message_form", { errors: [] });
});

// Handle new message submission
router.post(
  "/new-message",
  ensureAuthenticated,
  ensureMember,
  async (req, res) => {
    const { title, content } = req.body;
    const errors = [];

    if (!title || !content) {
      errors.push("Title and message content are required.");
      return res.render("message_form", { errors });
    }

    try {
      await createMessage({ title, content, userId: req.user.id });
      res.redirect("/");
    } catch (err) {
      console.error(err);
      errors.push("Failed to post message.");
      res.render("message_form", { errors });
    }
  }
);

router.post(
  "/delete-message/:id",
  ensureAuthenticated,
  ensureAdmin,
  async (req, res) => {
    const messageId = req.params.id;
    try {
      await deleteMessage(messageId);
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to delete message.");
    }
  }
);

module.exports = router;
