const pool = require("../db/pool");

// Create a new message
async function createMessage({ title, content, userId }) {
  const result = await pool.query(
    `INSERT INTO messages (title, content, user_id) 
     VALUES ($1, $2, $3) RETURNING *`,
    [title, content, userId]
  );
  return result.rows[0];
}

// Get all messages, joined with user info
async function getAllMessages() {
  const result = await pool.query(
    `SELECT messages.*, users.first_name, users.last_name, users.is_member 
     FROM messages 
     JOIN users ON messages.user_id = users.id 
     ORDER BY messages.created_at DESC`
  );
  return result.rows;
}

// Delete a message (admin only)
async function deleteMessage(id) {
  await pool.query("DELETE FROM messages WHERE id = $1", [id]);
}

module.exports = {
  createMessage,
  getAllMessages,
  deleteMessage,
};
