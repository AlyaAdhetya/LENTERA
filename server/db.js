import pkg from 'pg';
const { Pool } = pkg;
pkg.defaults.parseInt8 = true; // Auto convert COUNT() BigInt to int in JS
import dotenv from 'dotenv';

dotenv.config();

// Menggunakan tipe koneksi PostgreSQL (Pool)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Diperlukan untuk Supabase (SSL wajib)
    ssl: {
        rejectUnauthorized: false
    }
});

// Wrapper khusus agar tidak error di route Express yang asalnya untuk MySQL
// Fungsi untuk menerjemahkan MySQL spesifik ke Postgres
const applyPgHacks = (text) => {
    let pgText = text;
    pgText = pgText.replace(/is_active = 1/g, "is_active = true");
    pgText = pgText.replace(/is_active = 0/g, "is_active = false");
    pgText = pgText.replace(/CURDATE\(\)/g, "CURRENT_DATE");
    pgText = pgText.replace(/NOW\(\)/g, "CURRENT_TIMESTAMP");
    pgText = pgText.replace(/MONTH\(([^)]+)\)/g, "EXTRACT(MONTH FROM $1)");
    pgText = pgText.replace(/YEAR\(([^)]+)\)/g, "EXTRACT(YEAR FROM $1)");
    pgText = pgText.replace(/TIMESTAMPDIFF\(YEAR,\s*([^,]+),\s*([^)]+)\)/g, "EXTRACT(YEAR FROM age($2, $1))");
    pgText = pgText.replace(/AS\s+UNSIGNED/gi, "AS INTEGER");
    
    // Add RETURNING id for INSERT queries if not already present
    if (/^\s*INSERT\s+INTO/i.test(pgText) && !/RETURNING/i.test(pgText)) {
        pgText += " RETURNING id";
    }
    
    return pgText;
};

export const query = async (text, params) => {
    try {
        let pgText = applyPgHacks(text);

        if (params && params.length > 0) {
            let i = 1;
            while (pgText.includes('?')) {
                pgText = pgText.replace('?', `$${i}`);
                i++;
            }
        }
        
        // Jalankan query ke PostgreSQL
        const res = await pool.query(pgText, params);
        
        // Samakan struktur response dengan mysql2 ([rows, fields])
        const rows = res.rows;
        if (res.command === 'INSERT' && rows.length > 0 && rows[0].id) {
            rows.insertId = rows[0].id;
        }

        return [rows, res.fields];
    } catch (err) {
        console.error('DATABASE ERROR:', err.message, 'QUERY:', text, params);
        throw err;
    }
};

export const getConnection = async () => {
    const client = await pool.connect();
    return {
        query: async (text, params) => {
            let pgText = applyPgHacks(text);
            if (params && params.length > 0) {
                let i = 1;
                while (pgText.includes('?')) {
                    pgText = pgText.replace('?', `$${i}`);
                    i++;
                }
            }
            const res = await client.query(pgText, params);
            const rows = res.rows;
            if (res.command === 'INSERT' && rows.length > 0 && rows[0].id) {
                rows.insertId = rows[0].id;
            }
            return [rows, res.fields];
        },
        beginTransaction: () => client.query('BEGIN'),
        commit: () => client.query('COMMIT'),
        rollback: () => client.query('ROLLBACK'),
        release: () => client.release()
    };
};

// Export default dengan format yang mirip fitur pool di mysql2
export default {
    query,
    getConnection,
    pool
};
