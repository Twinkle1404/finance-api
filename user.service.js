const { queryAll, queryOne, runSql } = require('../config/database');
const AppError = require('../utils/AppError');
const { paginate, now } = require('../utils/helpers');

class UserService {
  /**
   * List all users with pagination.
   */
  list(query = {}) {
    const { page, limit, offset } = paginate(query.page, query.limit);

    const total = queryOne('SELECT COUNT(*) as count FROM users').count;
    const users = queryAll(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return { users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Get a single user by ID.
   */
  getById(id) {
    const user = queryOne(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  /**
   * Update user role.
   */
  updateRole(id, role) {
    const user = this.getById(id);
    runSql('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [role, now(), id]);
    return { ...user, role, updated_at: now() };
  }

  /**
   * Update user status (active / inactive).
   */
  updateStatus(id, status) {
    const user = this.getById(id);
    runSql('UPDATE users SET status = ?, updated_at = ? WHERE id = ?', [status, now(), id]);
    return { ...user, status, updated_at: now() };
  }

  /**
   * Delete a user permanently.
   */
  delete(id) {
    this.getById(id); // ensures user exists
    runSql('DELETE FROM financial_records WHERE user_id = ?', [id]);
    runSql('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = new UserService();
