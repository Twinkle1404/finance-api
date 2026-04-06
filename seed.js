/**
 * Seed script — populates the database with demo users + financial records.
 *
 * Run:  npm run seed   (or: node seed.js)
 */
const bcrypt = require('bcryptjs');
const { initDb, closeDb, queryOne, runSql, getDb } = require('./src/config/database');

async function seed() {
  await initDb();
  const db = getDb();
  console.log('🌱 Seeding database...\n');

  // ── Clear existing data ──
  runSql('DELETE FROM financial_records');
  runSql('DELETE FROM users');
  // Reset autoincrement
  try { runSql("DELETE FROM sqlite_sequence WHERE name IN ('users','financial_records')"); } catch (_) { /* ok if table doesn't exist */ }
  console.log('  ✓ Cleared existing data');

  // ── Seed Users ──
  const users = [
    { name: 'Admin User',   email: 'admin@finance.com',   password: 'admin123',   role: 'admin'   },
    { name: 'Analyst User', email: 'analyst@finance.com', password: 'analyst123', role: 'analyst' },
    { name: 'Viewer User',  email: 'viewer@finance.com',  password: 'viewer123',  role: 'viewer'  },
    { name: 'Jane Smith',   email: 'jane@finance.com',    password: 'jane12345',  role: 'viewer'  },
    { name: 'Bob Johnson',  email: 'bob@finance.com',     password: 'bob123456',  role: 'analyst' },
  ];

  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 12);
    runSql(
      `INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))`,
      [u.name, u.email, hash, u.role]
    );
  }
  console.log(`  ✓ Seeded ${users.length} users`);

  // ── Seed Financial Records ──
  const records = [
    // Income records
    { user_id: 1, type: 'income',  category: 'Salary',       amount: 8500.00, date: '2026-01-15', description: 'January salary'              },
    { user_id: 1, type: 'income',  category: 'Salary',       amount: 8500.00, date: '2026-02-15', description: 'February salary'             },
    { user_id: 1, type: 'income',  category: 'Salary',       amount: 8500.00, date: '2026-03-15', description: 'March salary'                },
    { user_id: 1, type: 'income',  category: 'Freelance',    amount: 2200.00, date: '2026-01-20', description: 'Web development project'     },
    { user_id: 1, type: 'income',  category: 'Freelance',    amount: 1800.00, date: '2026-02-22', description: 'Mobile app consultation'     },
    { user_id: 1, type: 'income',  category: 'Investments',  amount: 750.00,  date: '2026-01-31', description: 'Dividend payout Q1'          },
    { user_id: 1, type: 'income',  category: 'Investments',  amount: 1200.00, date: '2026-03-31', description: 'Stock sale profit'           },
    { user_id: 2, type: 'income',  category: 'Salary',       amount: 6000.00, date: '2026-01-15', description: 'January salary'              },
    { user_id: 2, type: 'income',  category: 'Salary',       amount: 6000.00, date: '2026-02-15', description: 'February salary'             },
    { user_id: 2, type: 'income',  category: 'Bonus',        amount: 3000.00, date: '2026-03-01', description: 'Quarterly performance bonus' },

    // Expense records
    { user_id: 1, type: 'expense', category: 'Rent',         amount: 2500.00, date: '2026-01-01', description: 'January apartment rent'      },
    { user_id: 1, type: 'expense', category: 'Rent',         amount: 2500.00, date: '2026-02-01', description: 'February apartment rent'     },
    { user_id: 1, type: 'expense', category: 'Rent',         amount: 2500.00, date: '2026-03-01', description: 'March apartment rent'        },
    { user_id: 1, type: 'expense', category: 'Utilities',    amount: 180.00,  date: '2026-01-05', description: 'Electricity + water bill'    },
    { user_id: 1, type: 'expense', category: 'Utilities',    amount: 195.00,  date: '2026-02-05', description: 'Electricity + water bill'    },
    { user_id: 1, type: 'expense', category: 'Utilities',    amount: 170.00,  date: '2026-03-05', description: 'Electricity + water bill'    },
    { user_id: 1, type: 'expense', category: 'Groceries',    amount: 620.00,  date: '2026-01-10', description: 'Monthly groceries'           },
    { user_id: 1, type: 'expense', category: 'Groceries',    amount: 580.00,  date: '2026-02-10', description: 'Monthly groceries'           },
    { user_id: 1, type: 'expense', category: 'Groceries',    amount: 650.00,  date: '2026-03-10', description: 'Monthly groceries'           },
    { user_id: 1, type: 'expense', category: 'Transport',    amount: 150.00,  date: '2026-01-08', description: 'Monthly metro pass'          },
    { user_id: 1, type: 'expense', category: 'Transport',    amount: 150.00,  date: '2026-02-08', description: 'Monthly metro pass'          },
    { user_id: 1, type: 'expense', category: 'Entertainment',amount: 250.00,  date: '2026-01-18', description: 'Concert tickets'             },
    { user_id: 1, type: 'expense', category: 'Healthcare',   amount: 320.00,  date: '2026-02-14', description: 'Dental checkup & cleaning'  },
    { user_id: 2, type: 'expense', category: 'Rent',         amount: 1800.00, date: '2026-01-01', description: 'January rent'                },
    { user_id: 2, type: 'expense', category: 'Rent',         amount: 1800.00, date: '2026-02-01', description: 'February rent'               },
    { user_id: 2, type: 'expense', category: 'Groceries',    amount: 450.00,  date: '2026-01-12', description: 'Weekly grocery shopping'     },
    { user_id: 2, type: 'expense', category: 'Subscriptions',amount: 85.00,   date: '2026-01-15', description: 'Streaming + cloud storage'   },
    { user_id: 2, type: 'expense', category: 'Education',    amount: 500.00,  date: '2026-02-20', description: 'Online course on data science'},
  ];

  for (const r of records) {
    runSql(
      `INSERT INTO financial_records (user_id, type, category, amount, date, description, is_deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`,
      [r.user_id, r.type, r.category, r.amount, r.date, r.description]
    );
  }
  console.log(`  ✓ Seeded ${records.length} financial records`);

  // ── Show summary ──
  const userCount = queryOne('SELECT COUNT(*) as c FROM users').c;
  const recCount = queryOne('SELECT COUNT(*) as c FROM financial_records').c;
  const totalIncome = queryOne("SELECT COALESCE(SUM(amount),0) as s FROM financial_records WHERE type='income'").s;
  const totalExpenses = queryOne("SELECT COALESCE(SUM(amount),0) as s FROM financial_records WHERE type='expense'").s;

  console.log('\n── Seed Summary ──');
  console.log(`  Users:          ${userCount}`);
  console.log(`  Records:        ${recCount}`);
  console.log(`  Total Income:   $${totalIncome.toLocaleString()}`);
  console.log(`  Total Expenses: $${totalExpenses.toLocaleString()}`);
  console.log(`  Net Balance:    $${(totalIncome - totalExpenses).toLocaleString()}`);

  console.log('\n── Demo Accounts ──');
  console.log('  admin@finance.com   / admin123    (admin)');
  console.log('  analyst@finance.com / analyst123  (analyst)');
  console.log('  viewer@finance.com  / viewer123   (viewer)');

  closeDb();
  console.log('\n✅ Seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
