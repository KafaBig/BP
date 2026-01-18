from flask import Flask, request, jsonify, session, current_app as app
from dotenv import load_dotenv
import uuid
import json
import logging
import random
from services.distractor_service import DistractorGenerator
from services.quiz_service import QuizService

load_dotenv()

logger = logging.getLogger(__name__)

def register_quiz_routes(app: Flask):
    
    quiz_service = QuizService()
    distractor_generator = None
    
    def get_distractor_generator():
        """Lazy load distractor generator"""
        nonlocal distractor_generator
        if distractor_generator is None:
            try:
                distractor_generator = DistractorGenerator()
                logger.info("Distractor generator initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize distractor generator: {e}")
                raise
        return distractor_generator
    
    @app.route('/start_quiz', methods=['POST'])
    def start_quiz():
        try:
            quiz_id = str(uuid.uuid4())
            
            session['quiz_id'] = quiz_id
            session['current_question'] = 0
            session.modified = True
            
            logger.info(f"Started quiz {quiz_id}")
            
            return jsonify({
                "status": "success",
                "quiz_id": quiz_id,
                "message": "Quiz started successfully"
            })
            
        except Exception as e:
            logger.error(f"Error starting quiz: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Failed to start quiz"
            }), 500

    @app.route('/get_all_questions', methods=['POST'])
    def get_all_questions():
        try:
            logger.info("Starting get_all_questions endpoint")
            
            questions_data = quiz_service.load_questions()
            logger.info(f"Loaded questions data: generated={len(questions_data['generated'])}, manual={len(questions_data['manual'])}")
            
            if not questions_data['generated'] and not questions_data['manual']:
                logger.error("No questions found in data files")
                return jsonify({
                    "status": "error",
                    "message": "No questions available"
                }), 500
            
            # Ensure exactly 10 of each type for consistent evaluation
            if len(questions_data['generated']) < 10:
                logger.error(f"Need at least 10 questions for AI generation, found {len(questions_data['generated'])}")
                return jsonify({
                    "status": "error",
                    "message": "Insufficient questions for AI generation"
                }), 500
                
            if len(questions_data['manual']) < 10:
                logger.error(f"Need at least 10 manual questions, found {len(questions_data['manual'])}")
                return jsonify({
                    "status": "error",
                    "message": "Insufficient manual questions"
                }), 500
            
            # Select exactly 10 of each type
            questions_for_ai = random.sample(questions_data['generated'], 10)
            questions_with_manual = random.sample(questions_data['manual'], 10)
            
            logger.info("Selected exactly 10 questions for AI generation and 10 with manual distractors")
            
            try:
                generator = get_distractor_generator()
            except Exception as e:
                logger.error(f"Failed to get distractor generator: {e}")
                return jsonify({
                    "status": "error",
                    "message": "Model initialization failed"
                }), 500
            
            quiz_data = []
            
            # Add manual questions first
            for question in questions_with_manual:
                quiz_data.append({
                    'question': question['question'],
                    'question_de': question.get('translation', {}).get('de', ''),
                    'correct_answer': question['answer'],
                    'distractors': question['distractors'],
                    'is_generated': False
                })
            
            # Generate AI distractors for exactly 10 questions
            logger.info("Generating AI distractors for 10 questions...")
            for i, question in enumerate(questions_for_ai):
                logger.info(f"Processing AI question {i+1}/10: {question['question'][:50]}...")
                
                try:
                    distractors = generator.generate_distractors(
                        question['question'], 
                        question['answer']
                    )
                    
                    if not distractors or len(distractors) < 3:
                        logger.error(f"Failed to generate sufficient distractors for question {i+1}")
                        return jsonify({
                            "status": "error",
                            "message": f"Model failed to generate distractors for question {i+1}"
                        }), 500
                    
                    quiz_data.append({
                        'question': question['question'],
                        'question_de': question.get('translation', {}).get('de', ''),
                        'correct_answer': question['answer'],
                        'distractors': distractors,
                        'is_generated': True
                    })
                    
                    logger.info(f"Successfully generated {len(distractors)} distractors for AI question {i+1}")
                    
                except Exception as e:
                    logger.error(f"Failed to generate distractors for question {i+1}: {e}")
                    return jsonify({
                        "status": "error",
                        "message": f"Model generation failed for question {i+1}"
                    }), 500
            
            # Verify we have exactly 20 questions (10 AI + 10 manual)
            if len(quiz_data) != 20:
                logger.error(f"Expected 20 questions, got {len(quiz_data)}")
                return jsonify({
                    "status": "error",
                    "message": "Failed to generate complete question set"
                }), 500
            
            random.shuffle(quiz_data)
            
            quiz_id = str(uuid.uuid4())
            quiz_service.store_quiz_data(quiz_id, quiz_data)
            
            session['quiz_id'] = quiz_id
            session.modified = True
            
            logger.info("Successfully created quiz with exactly 10 AI-generated and 10 manual questions")
            
            return jsonify({
                "status": "success", 
                "message": "Quiz generated with 10 AI + 10 manual questions", 
                "quiz_id": quiz_id,
                "questions": quiz_data,
                "total_questions": 20,
                "generated_questions": 10,
                "manual_questions": 10
            })
            
        except Exception as e:
            logger.error(f"Error in get_all_questions: {str(e)}")
            return jsonify({
                "status": "error",
                "message": f"Failed to generate questions: {str(e)}"
            }), 500

    @app.route('/submit_quiz', methods=['POST'])
    def submit_quiz():
        """Submit completed quiz answers"""
        try:
            data = request.json
            if not data:
                return jsonify({
                    "status": "error",
                    "message": "No data provided"
                }), 400

            required_fields = ['quiz_id', 'answers', 'score', 'avg_confidence', 'total_questions']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        "status": "error",
                        "message": f"Missing required field: {field}"
                    }), 400

            result = quiz_service.submit_quiz(data)

            # Clear session data after successful submission
            session.pop('quiz_id', None)
            session.pop('current_question', None)
            session.modified = True

            return jsonify({
                "status": "success",
                "message": "Quiz submitted successfully",
                "result": result
            })
        except Exception as e:
            logger.error(f"Error submitting quiz: {str(e)}")
            return jsonify({
                "status": "error",
                "message": f"Failed to submit quiz: {str(e)}"
            }), 500