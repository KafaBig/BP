import json
import sqlite3
from flask import current_app
from models.database import get_db

class QuizModel:
    
    @staticmethod
    def save_quiz_result(quiz_data):
        db = get_db()
        cursor = db.cursor()
        
        try:
            cursor.execute(
                "SELECT quiz_id FROM quiz_results WHERE quiz_id = ?", 
                (quiz_data['quiz_id'],)
            )
            existing_quiz = cursor.fetchone()
            
            if existing_quiz:
                return {"message": "Quiz already submitted", "quiz_id": quiz_data['quiz_id']}
            
            cursor.execute(
                '''INSERT INTO quiz_results (quiz_id, participant_name, score, avg_confidence)
                   VALUES (?, ?, ?, ?)''',
                (
                    quiz_data['quiz_id'], 
                    quiz_data.get('participant_name', 'Anonymous'),
                    quiz_data['score'], 
                    float(quiz_data['avg_confidence'])
                )
            )
            
            for answer in quiz_data['answers']:
                if all(key in answer for key in ['question', 'answer', 'not_selected_answers', 'is_correct', 'confidence', 'is_generated']):
                    cursor.execute(
                        '''INSERT INTO quiz_answers
                           (quiz_id, question, answer, not_selected_answers, is_correct, confidence, is_generated, question_type)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                        (
                            quiz_data['quiz_id'],
                            answer['question'],
                            str(answer['answer']),
                            json.dumps(answer['not_selected_answers']),
                            1 if answer['is_correct'] else 0,
                            answer['confidence'],
                            1 if answer.get('is_generated', True) else 0,
                            'AI' if answer.get('is_generated', True) else 'Manual'
                        )
                    )
            
            db.commit()
            return {"message": "Quiz submitted successfully", "quiz_id": quiz_data['quiz_id']}
            
        except sqlite3.Error as e:
            db.rollback()
            raise Exception(f"Database error: {str(e)}")
    
    @staticmethod
    def get_quiz_results(quiz_id):
        db = get_db()
        cursor = db.cursor()
        
        try:
            cursor.execute(
                "SELECT * FROM quiz_results WHERE quiz_id = ?", 
                (quiz_id,)
            )
            quiz_result = cursor.fetchone()
            
            if not quiz_result:
                return None
                
            cursor.execute(
                "SELECT * FROM quiz_answers WHERE quiz_id = ?", 
                (quiz_id,)
            )
            answers = cursor.fetchall()
            
            result = dict(quiz_result)
            result['answers'] = [dict(answer) for answer in answers]
            
            return result
            
        except sqlite3.Error as e:
            raise Exception(f"Database error: {str(e)}")