from flask import Flask, jsonify
import logging

logger = logging.getLogger(__name__)

def register_health_routes(app: Flask):

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "message": "Quiz app is running"
        })
