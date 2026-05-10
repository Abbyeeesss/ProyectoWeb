import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { DB_PATH } from "../config.js";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS provincia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pais_id INTEGER NOT NULL REFERENCES pais(id) ON DELETE CASCADE,
      nombre TEXT NOT NULL,
      UNIQUE(pais_id, nombre)
    );

    CREATE TABLE IF NOT EXISTS ciudad (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provincia_id INTEGER NOT NULL REFERENCES provincia(id) ON DELETE CASCADE,
      nombre TEXT NOT NULL,
      UNIQUE(provincia_id, nombre)
    );

    CREATE TABLE IF NOT EXISTS categoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT
    );

    CREATE TABLE IF NOT EXISTS proveedor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_comercial TEXT NOT NULL,
      ruc TEXT NOT NULL UNIQUE,
      representante_legal TEXT NOT NULL,
      documento_identidad TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      ciudad_id INTEGER NOT NULL REFERENCES ciudad(id)
    );

    CREATE TABLE IF NOT EXISTS producto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      proveedor_id INTEGER NOT NULL REFERENCES proveedor(id),
      categoria_id INTEGER NOT NULL REFERENCES categoria(id),
      precio_referencia REAL NOT NULL DEFAULT 0,
      es_perecedero INTEGER NOT NULL DEFAULT 0,
      stock_actual REAL NOT NULL DEFAULT 0,
      dias_lead_time INTEGER NOT NULL DEFAULT 7
    );
  `);
}

export default db;
