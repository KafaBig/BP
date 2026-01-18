import logging
import os
from logging.handlers import RotatingFileHandler
from flask import jsonify

def configure_logging(app):
    """Configure application logging"""
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    log_level = logging.DEBUG if app.debug else logging.INFO
    
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    file_handler = RotatingFileHandler(
        'logs/quiz_app.log', 
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    file_handler.setLevel(log_level)
    
    app.logger.addHandler(file_handler)
    
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    
    return app

class QuizError(Exception):
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

def handle_quiz_error(error, default_message="An error occurred"):
    logger = logging.getLogger(__name__)
    
    if isinstance(error, QuizError):
        logger.error(f"Quiz error: {error.message}")
        return jsonify({
            "status": "error",
            "message": error.message
        }), error.status_code
    else:
        logger.error(f"Unexpected error: {str(error)}")
        return jsonify({
            "status": "error", 
            "message": default_message
        }), 500