const { queryAll, queryOne, runSql } = require('../config/database');
const AppError = require('../utils/AppError');
const { paginate, now } = require('../utils/helpers');

class RecordService {
  /**
   * Create a financial record.
   */
  create(data, userId) {
    const timestamp = now();
    const result = runSql(
      `INSERT INTO financial_records (user_id, type, category, amount, date, description, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [userId, data.type, data.category, data.amount, data.date, data.description || null, timestamp, timestamp]
    );

    return this.getById(result.lastInsertRowid);
  }

  /**
   * List records with filters, pagination, and sorting.
   */
  list(query = {}) {
    const { page, limit, offset } = paginate(query.page, query.limit);

    let where = 'WHERE is_deleted = 0';
    const params = [];

    if (query.type) {
      where += ' AND type = ?';
      params.push(query.type);
    }
    if (query.category) {
      where += ' AND category LIKE ?';
      params.push(`%${query.category}%`);
    }
    if (query.from) {
      where += ' AND date >= ?';
      params.push(query.from);
    }
    if (query.to) {
      where += ' AND date <= ?';
      params.push(query.to);
    }

    // Whitelist sort columns to prevent injection
    const sortCol = ['date', 'amount', 'category', 'created_at'].includes(query.sort) ? query.sort : 'date';
    const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC';

    const total = queryOne(`SELECT COUNT(*) as count FROM financial_records ${where}`, params).count;

    const records = queryAll(
      `SELECT fr.*, u.name as user_name
       FROM financial_records fr
       JOIN users u ON u.id = fr.user_id
       ${where}
       ORDER BY ${sortCol} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { records, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Get a single (non-deleted) record by ID.
   */
  getById(id) {
    const record = queryOne(
      `SELECT fr.*, u.name as user_name
       FROM financial_records fr
       JOIN users u ON u.id = fr.user_id
       WHERE fr.id = ? AND fr.is_deleted = 0`,
      [id]
    );
    if (!record) throw new AppError('Financial record not found.', 404);
    return record;
  }

  /**
   * Update a record.
   */
  update(id, data) {
    this.getById(id); // ensure exists

    const fields = [];
    const params = [];
    for (const key of ['type', 'category', 'amount', 'date', 'description']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    fields.push('updated_at = ?');
    params.push(now());
    params.push(id);

    runSql(`UPDATE financial_records SET ${fields.join(', ')} WHERE id = ?`, params);

    return this.getById(id);
  }

  /**
   * Soft-delete a record.
   */
  softDelete(id) {
    this.getById(id); // ensure exists
    runSql('UPDATE financial_records SET is_deleted = 1, updated_at = ? WHERE id = ?', [now(), id]);
  }
}

module.exports = new RecordService();
