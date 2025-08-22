import { getDBConnection } from '../db/db';
import CryptoJS from 'crypto-js'; // Correct import

const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString(); // Use SHA256 hash
};

// Register a new user with username, password, and role
export const registerUser = async (username, password, role) => {
  const db = await getDBConnection();
  const passwordHash = hashPassword(password);

  try {
    await db.executeSql(
      `INSERT INTO Users (username, password_hash, role) VALUES (?, ?, ?)`,
      [username, passwordHash, role]
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login and return user info
export const loginUser = async (username, password) => {
  const db = await getDBConnection();
  const passwordHash = hashPassword(password);

  const result = await db.executeSql(
    `SELECT * FROM Users WHERE username = ? AND password_hash = ?`,
    [username, passwordHash]
  );

  if (result[0].rows.length > 0) {
    return { success: true, user: result[0].rows.item(0) };
  } else {
    return { success: false, error: 'Invalid username or password' };
  }
};
