const fs = require('fs');
let content = fs.readFileSync('D:/SIM/Progress/LENTERA/server/db.js', 'utf-8');

// Build replacement for `query`
const replacement = `// Fungsi untuk menerjemahkan MySQL spesifik ke Postgres
const applyPgHacks = (text) => {
    let pgText = text;
    pgText = pgText.replace(/is_active = 1/g, "is_active = true");
    pgText = pgText.replace(/is_active = 0/g, "is_active = false");
    pgText = pgText.replace(/CURDATE\\(\\)/g, "CURRENT_DATE");
    pgText = pgText.replace(/NOW\\(\\)/g, "CURRENT_TIMESTAMP");
    pgText = pgText.replace(/MONTH\\(([^)]+)\\)/g, "EXTRACT(MONTH FROM $1)");
    pgText = pgText.replace(/YEAR\\(([^)]+)\\)/g, "EXTRACT(YEAR FROM $1)");
    pgText = pgText.replace(/TIMESTAMPDIFF\\(YEAR,\\s*([^,]+),\\s*([^)]+)\\)/g, "EXTRACT(YEAR FROM age($2, $1))");
    return pgText;
};

export const query = async (text, params) => {
    try {
        let pgText = applyPgHacks(text);`;

content = content.replace(/export const query = async \(text, params\) => \{\s*try \{[^]*?(?=\s*if \(params && params\.length > 0\))/m, replacement);

// Build replacement for `getConnection`
content = content.replace(/export const getConnection = async \(\) => \{\s*const client = await pool\.connect\(\);\s*return \{\s*query: async \(text, params\) => \{\s*let pgText = text;/, 
`export const getConnection = async () => {
    const client = await pool.connect();
    return {
        query: async (text, params) => {
            let pgText = applyPgHacks(text);`);

fs.writeFileSync('D:/SIM/Progress/LENTERA/server/db.js', content, 'utf-8');
