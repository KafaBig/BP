from dotenv import load_dotenv
import os

load_dotenv()

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from config import get_config


def create_app():
    app = Flask(__name__,
                static_folder='dist',
                static_url_path='')
    
    config_name = os.environ.get('FLASK_ENV', 'development')

    config = get_config(config_name)
    app.config.from_object(config)

    app.secret_key = config.SECRET_KEY
    app.config['DB_PATH'] = config.DB_PATH

    import logging
    logging.basicConfig(level=logging.INFO)

    cors_origins = os.environ.get('CORS_ORIGINS', '*')
    if cors_origins == '*':
        cors_origins = ['*']
    else:
        cors_origins = cors_origins.split(',')
    CORS(app, origins=cors_origins, supports_credentials=True)

    with app.app_context():
        from models.database import init_db, init_app
        init_app(app)
        init_db()

    from routes.quiz_routes import register_quiz_routes
    register_quiz_routes(app)

    @app.route('/health')
    def health():
        return jsonify({"status": "healthy", "message": "Quiz app is running"})

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_app(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    
    print(f"🧠 Starting Quiz App")
    print(f"🚀 Server: http://{host}:{port}")
    print(f"🔍 Health: http://{host}:{port}/health")
    print(f"🔧 Debug: {debug}")

    app.run(host=host, port=port, debug=debug)