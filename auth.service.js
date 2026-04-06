const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, runSql } = require('../config/database');
const AppError = require('../utils/AppError');
const { now } = require('../utils/helpers');

class AuthService {
  /**
   * Register a new user.
   */
  register({ name, email, password }) {
    // Check duplicate email
    const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      throw new AppError('Email is already registered.', 409);
    }

    const password_hash = bcrypt.hashSync(password, 12);
    const timestamp = now();

    const result = runSql(
      `INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
       VALUES (?, ?, ?, 'viewer', 'active', ?, ?)`,
      [name, email, password_hash, timestamp, timestamp]
    );

    const user = queryOne(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
      [result.lastInsertRowid]
    );

    return { user, token: this._signToken(user.id, user.role) };
  }

  /**
   * Login with email + password.
   */
  login({ email, password }) {
    const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      throw new AppError('Invalid email or password.', 401);
    }
    if (user.status !== 'active') {
      throw new AppError('Your account has been deactivated.', 403);
    }

    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token: this._signToken(user.id, user.role) };
  }

  /**
   * Get current user profile from id.
   */
  getProfile(userId) {
    const user = queryOne(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  /**
   * Sign a JWT.
   */
  _signToken(id, role) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
  }
}

module.exports = new AuthService();
