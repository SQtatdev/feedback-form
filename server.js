const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Инициализация базы данных
const db = new sqlite3.Database('./feedback.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Создание таблицы
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        bangladesh BOOLEAN DEFAULT 0,
        train BOOLEAN DEFAULT 0,
        women BOOLEAN DEFAULT 0,
        snacks BOOLEAN DEFAULT 0,
        home BOOLEAN DEFAULT 0,
        custom_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// API для сохранения фидбека
app.post('/api/feedback', (req, res) => {
    const feedbackData = req.body;
    
    console.log('Received feedback:', feedbackData);

    const stmt = db.prepare(`INSERT INTO feedback 
        (subject, bangladesh, train, women, snacks, home, custom_text) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`);

    stmt.run([
        feedbackData.subject,
        feedbackData.bangladesh ? 1 : 0,
        feedbackData.train ? 1 : 0,
        feedbackData.women ? 1 : 0,
        feedbackData.snacks ? 1 : 0,
        feedbackData.home ? 1 : 0,
        feedbackData.custom_text || ''
    ], function(err) {
        if (err) {
            console.error('Error saving to database:', err);
            return res.status(500).json({ 
                success: false, 
                error: err.message 
            });
        }
        console.log(`Feedback saved with ID: ${this.lastID}`);
        res.json({ 
            success: true, 
            id: this.lastID 
        });
    });
    
    stmt.finalize();
});

// API для получения всех фидбеков
app.get('/api/feedback', (req, res) => {
    db.all(`SELECT * FROM feedback ORDER BY created_at DESC`, (err, rows) => {
        if (err) {
            console.error('Error fetching feedback:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// API для получения статистики
app.get('/api/stats', (req, res) => {
    db.all(`
        SELECT subject, 
               COUNT(*) as total,
               SUM(bangladesh) as bangladesh_count,
               SUM(train) as train_count,
               SUM(women) as women_count,
               SUM(snacks) as snacks_count,
               SUM(home) as home_count
        FROM feedback 
        GROUP BY subject
    `, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// ✅ ВАЖНО: Маршрут для админ-панели
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ✅ Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`📝 Feedback form: http://localhost:${PORT}`);
});