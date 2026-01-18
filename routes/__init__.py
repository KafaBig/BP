from .quiz_routes import register_quiz_routes

def register_routes(app):
    register_quiz_routes(app)

__all__ = ['register_routes']