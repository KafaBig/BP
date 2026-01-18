import json
import os
import logging
from models.quiz import QuizModel

logger = logging.getLogger(__name__)

class QuizService:

    def __init__(self):
        self.questions_file = os.environ.get('QUESTIONS_FILE', 'quiz_results/arithmetik_questions.json')
        self.questions_with_distractors_file = 'quiz_results/arithmetik_questions_with_distractors.json'
        self.quiz_data_store = {}

    def load_questions(self):
        try:
            # questions for AI
            with open(self.questions_file, 'r', encoding='utf-8') as f:
                generated_questions = json.load(f)

            # questions manual distractors
            with open(self.questions_with_distractors_file, 'r', encoding='utf-8') as f:
                manual_questions = json.load(f)

            return {
                'generated': generated_questions,
                'manual': manual_questions
            }
        except Exception as e:
            logger.error(f"Error loading questions: {str(e)}")
            raise

    def store_quiz_data(self, quiz_id, quiz_data):
        self.quiz_data_store[quiz_id] = quiz_data
        logger.info(f"Stored quiz data for quiz_id: {quiz_id}")

    def get_quiz_data(self, quiz_id):
        return self.quiz_data_store.get(quiz_id)

    def submit_quiz(self, quiz_data):
        try:
            result = QuizModel.save_quiz_result(quiz_data)
            logger.info(f"Quiz submitted successfully: {quiz_data['quiz_id']}")

            if quiz_data['quiz_id'] in self.quiz_data_store:
                del self.quiz_data_store[quiz_data['quiz_id']]

            return result
        except Exception as e:
            logger.error(f"Error submitting quiz: {str(e)}")
            raise
