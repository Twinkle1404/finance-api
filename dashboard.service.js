const { queryAll, queryOne } = require('../config/database');

class DashboardService {
  /**
   * Build a dynamic WHERE clause from filter params.
   * @param {object} filters - { from, to, type, category, user_id }
   * @returns {{ where: string, params: any[] }}
   */
  _buildFilters(filters = {}) {
    let where = 'WHERE fr.is_deleted = 0';
    const params = [];

    if (filters.from) {
      where += ' AND fr.date >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      where += ' AND fr.date <= ?';
      params.push(filters.to);
    }
    if (filters.type) {
      where += ' AND fr.type = ?';
      params.push(filters.type);
    }
    if (filters.category) {
      where += ' AND fr.category LIKE ?';
      params.push(`%${filters.category}%`);
    }
    if (filters.user_id) {
      where += ' AND fr.user_id = ?';
      params.push(filters.user_id);
    }

    return { where, params };
  }

  /**
   * Build a simpler WHERE for tables without alias.
   */
  _buildSimpleFilters(filters = {}) {
    let where = 'WHERE is_deleted = 0';
    const params = [];

    if (filters.from) {
      where += ' AND date >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      where += ' AND date <= ?';
      params.push(filters.to);
    }
    if (filters.type) {
      where += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters.category) {
      where += ' AND category LIKE ?';
      params.push(`%${filters.category}%`);
    }
    if (filters.user_id) {
      where += ' AND user_id = ?';
      params.push(filters.user_id);
    }

    return { where, params };
  }

  /**
   * Summary: total income, total expenses, net balance, record count.
   * Accepts dynamic filters: from, to, type, category, user_id.
   */
  getSummary(filters = {}) {
    const { where, params } = this._buildSimpleFilters(filters);

    const result = queryOne(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
        COUNT(*) AS record_count
      FROM financial_records
      ${where}
    `, params);

    return {
      total_income: result.total_income,
      total_expenses: result.total_expenses,
      net_balance: +(result.total_income - result.total_expenses).toFixed(2),
      record_count: result.record_count,
      filters_applied: Object.keys(filters).filter((k) => filters[k] !== undefined),
    };
  }

  /**
   * Category breakdown: totals grouped by category and type.
   * Accepts dynamic filters.
   */
  getCategoryBreakdown(filters = {}) {
    const { where, params } = this._buildSimpleFilters(filters);

    return queryAll(`
      SELECT
        category,
        type,
        SUM(amount) AS total,
        COUNT(*) AS count
      FROM financial_records
      ${where}
      GROUP BY category, type
      ORDER BY total DESC
    `, params);
  }

  /**
   * Monthly trends: income vs expense per month.
   * Accepts dynamic filters.
   */
  getMonthlyTrends(filters = {}) {
    const { where, params } = this._buildSimpleFilters(filters);

    return queryAll(`
      SELECT
        strftime('%Y-%m', date) AS month,
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
      FROM financial_records
      ${where}
      GROUP BY month
      ORDER BY month ASC
    `, params);
  }

  /**
   * Recent activity: latest records with dynamic filters + configurable limit.
   */
  getRecentActivity(filters = {}, limit = 10) {
    const { where, params } = this._buildFilters(filters);

    return queryAll(`
      SELECT fr.*, u.name as user_name
      FROM financial_records fr
      JOIN users u ON u.id = fr.user_id
      ${where}
      ORDER BY fr.created_at DESC
      LIMIT ?
    `, [...params, limit]);
  }
}

module.exports = new DashboardService();
