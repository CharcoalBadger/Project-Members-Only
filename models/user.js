const pool = require("../db/pool");

async function createUser({ firstName, lastName, email, hashedPassword }) {
  const res = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [firstName, lastName, email, hashedPassword]
  );
  return res.rows[0];
}

module.exports = {
  createUser,
  // add more functions later
};
