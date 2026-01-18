import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    DB_PATH = os.environ.get('DB_PATH') or 'data/quiz_db.sqlite'
    
    QUESTIONS_FILE = os.environ.get('QUESTIONS_FILE') or 'quiz_results/arithmetik_questions.json'
    QUESTIONS_PER_QUIZ = 20 
    
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
    
    MODEL_PATH = os.environ.get('MODEL_PATH', './downloaded_model')

class DevelopmentConfig(Config):
    DEBUG = True
    FLASK_ENV = 'development'
    
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000']

class NgrokConfig(DevelopmentConfig):
    CORS_ORIGINS = ['*']
    
    LOG_LEVEL = 'INFO'

class ProductionConfig(Config):
    DEBUG = False
    FLASK_ENV = 'production'
    
    MODEL_PATH = os.environ.get('MODEL_PATH', 'downloaded_model')
    QUESTIONS_PER_QUIZ = int(os.environ.get('QUESTIONS_PER_QUIZ', '15'))
    
    ENABLE_GPU = os.environ.get('ENABLE_GPU', 'true').lower() == 'true'
    MODEL_TIMEOUT = int(os.environ.get('MODEL_TIMEOUT', '120'))
    
    CORS_ORIGINS = [
        'https://localhost:5173',
        'https://localhost:3000', 
        'https://127.0.0.1:5173',
        'https://127.0.0.1:3000'
    ]

config_by_name = {
    'development': DevelopmentConfig,
    'ngrok': NgrokConfig,
    'production': ProductionConfig
}

def get_config(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    return config_by_name.get(config_name, DevelopmentConfig)