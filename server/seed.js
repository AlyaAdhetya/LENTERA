// seed.js - Run once to fix passwords in database
import bcrypt from 'bcryptjs';
import pool from './db.js';

async function seed() {
    try {
        const adminHash = await bcrypt.hash('admin123', 10);
        const dokterHash = await bcrypt.hash('dokter123', 10);

        await pool.query('UPDATE users SET password = ? WHERE username = ?', [adminHash, 'admin']);
        await pool.query('UPDATE users SET password = ? WHERE role = ?', [dokterHash, 'dokter']);

        const [users] = await pool.query('SELECT id, username, role, LEFT(password, 25) as hash_preview FROM users');
        console.log('✅ Passwords updated successfully!');
        console.table(users);

        // Verify passwords work
        const [admin] = await pool.query('SELECT password FROM users WHERE username = ?', ['admin']);
        const match = await bcrypt.compare('admin123', admin[0].password);
        console.log('🔑 Admin password verification:', match ? '✅ PASS' : '❌ FAIL');

        const [dokter] = await pool.query('SELECT password FROM users WHERE username = ?', ['dr.sari']);
        const match2 = await bcrypt.compare('dokter123', dokter[0].password);
        console.log('🔑 Dokter password verification:', match2 ? '✅ PASS' : '❌ FAIL');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seed();
