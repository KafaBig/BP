import sqlite3
import os
from flask import current_app, g
import logging

logger = logging.getLogger(__name__)

def get_db():
    """Get database connection from global context or create new one"""
    if 'db' not in g:
        db_path = current_app.config['DB_PATH']
        g.db = sqlite3.connect(
            db_path,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    
    return g.db

def close_db(e=None):
    """Close database connection if exists"""
    db = g.pop('db', None)
    
    if db is not None:
        db.close()

def init_db():
    """Initialize database"""
    logger.info("Initializing SQLite database...")
    
    db_path = current_app.config['DB_PATH'] if current_app else os.environ.get('DB_PATH', '/app/data/quiz_db.sqlite')
    
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
        logger.info(f"Ensured database directory exists: {db_dir}")
    
    logger.info(f"Using database path: {db_path}")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_results (
                quiz_id TEXT PRIMARY KEY,
                participant_name TEXT,
                score INTEGER,
                avg_confidence FLOAT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quiz_id TEXT,
                question TEXT,
                answer TEXT,
                not_selected_answers TEXT,
                is_correct BOOLEAN,
                confidence INTEGER,
                is_generated BOOLEAN,
                question_type TEXT,
                FOREIGN KEY (quiz_id) REFERENCES quiz_results(quiz_id)
            )
        ''')

        cursor.execute("PRAGMA table_info(quiz_answers)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_generated' not in columns:
            cursor.execute('''
                ALTER TABLE quiz_answers 
                ADD COLUMN is_generated BOOLEAN
            ''')
            
        if 'question_type' not in columns:
            cursor.execute('''
                ALTER TABLE quiz_answers 
                ADD COLUMN question_type TEXT
            ''')

        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_quiz_answers_quiz_id 
            ON quiz_answers(quiz_id)
        ''')

        conn.commit()
        logger.info("SQLite database initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def init_app(app):
    """Register database with Flask"""
    app.teardown_appcontext(close_db)