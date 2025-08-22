import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDBConnection = async () => {
  return SQLite.openDatabase({ name: 'inventory.db', location: 'default' });
};

export const createTables = async (db) => {
  await db.executeSql(`PRAGMA foreign_keys = ON`);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('Owner', 'Staff', 'IT admin')) NOT NULL
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Suppliers (
      supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_info TEXT,
      address TEXT
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      unit_price REAL,
      supplier_id INTEGER,
      FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id)
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Inventory (
      product_id INTEGER PRIMARY KEY,
      quantity INTEGER NOT NULL DEFAULT 0,
      threshold INTEGER,
      expiration_date TEXT,
      FOREIGN KEY (product_id) REFERENCES Products(product_id)
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Resupplied_items (
      resupplied_items_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      user_id INTEGER,
      supplier_id INTEGER,
      quantity INTEGER,
      unit_cost REAL,
      resupply_date TEXT,
      expiration_date TEXT,
      FOREIGN KEY (product_id) REFERENCES Products(product_id),
      FOREIGN KEY (user_id) REFERENCES Users(user_id),
      FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id)
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Sales (
      sales_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      sales_date TEXT,
      FOREIGN KEY (user_id) REFERENCES Users(user_id)
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Sale_items (
      sales_items_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      amount REAL,
      total_amount REAL,
      stockout_reason TEXT CHECK(stockout_reason IN ('sold', 'expired')),
      FOREIGN KEY (sales_id) REFERENCES Sales(sales_id),
      FOREIGN KEY (product_id) REFERENCES Products(product_id)
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS Backup (
      backup_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      timestamp TEXT,
      location TEXT,
      FOREIGN KEY (user_id) REFERENCES Users(user_id)
    );
  `);
};
