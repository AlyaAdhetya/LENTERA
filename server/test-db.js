import db from './db.js';

async function test() {
    try {
        console.log('Testing DB connection...');
        const [rows] = await db.query('SELECT * FROM poli');
        console.log('Success! Rows:', rows);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        process.exit();
    }
}
test();