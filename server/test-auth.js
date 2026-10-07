import pool from './db.js';

async function testAuth() {
    try {
        console.log("Testing auth query...");
        const [users] = await pool.query(
            'SELECT u.*, p.nama_poli FROM users u LEFT JOIN poli p ON u.poli_id = p.id WHERE u.username = ? AND u.is_active = 1',
            ['admin']
        );
        console.log("Users:", users);
    } catch (err) {
        console.error("Error:", err);
    }
    process.exit(0);
}
testAuth();
