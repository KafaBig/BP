import os
import logging
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import re
from typing import List, Optional
import gc

logger = logging.getLogger(__name__)

class DistractorGenerator:
    
    def __init__(self, model_path: Optional[str] = None):
        self.device = self._setup_device()
        
        if model_path:
            self.model_path = model_path
        else:
            self.model_path = os.environ.get("MODEL_PATH", "./downloaded_model")
        
        logger.info(f"Initializing DistractorGenerator with device: {self.device}")
        logger.info(f"Model path: {self.model_path}")
        
        self._load_model()
        
        logger.info("DistractorGenerator initialized successfully")
    
    def _setup_device(self) -> torch.device:
        if torch.cuda.is_available():
            device = torch.device("cuda")
            logger.info(f"Using GPU: {torch.cuda.get_device_name(0)}")
            return device
        else:
            logger.warning("CUDA not available, using CPU")
            return torch.device("cpu")
    
    def _load_model(self):
        try:
            logger.info(f"Loading tokenizer from {self.model_path}")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_path,
                local_files_only=True,
                use_fast=True
            )
            
            logger.info(f"Loading model from {self.model_path}")
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                self.model_path,
                local_files_only=True,
                torch_dtype=torch.float16 if self.device.type == 'cuda' else torch.float32,
                device_map="auto" if self.device.type == 'cuda' else None
            )
            
            if self.device.type == 'cpu':
                self.model = self.model.to(self.device)
            
            self.model.eval()
            
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            logger.info("Model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def generate_distractors(self, question: str, answer: str, num_distractors: int = 3, max_length: int = 100) -> List[str]:
        try:
            prompt = f"Question: {question} Answer: {answer}"
            
            logger.debug(f"Generate input: '{prompt}'")
            
            inputs = self.tokenizer(prompt, return_tensors="pt", padding=True)
            input_ids = inputs["input_ids"].to(self.device)
            attention_mask = inputs["attention_mask"].to(self.device)
            
            with torch.no_grad():
                output = self.model.generate(
                    input_ids,
                    attention_mask=attention_mask,
                    max_length=min(len(input_ids[0]) + max_length, 512),
                    num_return_sequences=num_distractors * 2,
                    num_beams=num_distractors * 2,
                    temperature=0.8,
                    top_p=0.92,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.2,
                    no_repeat_ngram_size=2,
                    early_stopping=True
                )
            
            all_distractors = []
            for seq in output:
                generated_text = self.tokenizer.decode(seq, skip_special_tokens=True)
                logger.debug(f"Raw generated: '{generated_text}'")
                
                distractors = self._extract_distractors_seq2seq(generated_text)
                all_distractors.extend(distractors)
            
            result = self._filter_distractors(all_distractors, answer, num_distractors)
            logger.info(f"Generated distractors: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error generating distractors: {e}")
    
    def _extract_distractors_seq2seq(self, generated_text: str) -> List[str]:
        distractors = []
        
        if "<distractor1>" in generated_text:
            distractor_parts = generated_text.split("<distractor")
            for i in range(1, len(distractor_parts)):
                part = distractor_parts[i]
                if ">" in part:
                    distractor = part.split(">", 1)[1].strip()
                    if "<distractor" in distractor:
                        distractor = distractor.split("<distractor")[0].strip()
                    distractors.append(distractor)
        else:
            distractors_text = generated_text.strip()
            
            if ',' in distractors_text:
                distractors = [d.strip() for d in distractors_text.split(',')]
            else:
                potential_distractors = distractors_text.split()
                if all(self._is_numeric(d) for d in potential_distractors):
                    distractors = potential_distractors
                else:
                    distractors = [distractors_text]
        
        return [d for d in distractors if d.strip()]
    
    def _is_numeric(self, text: str) -> bool:
        try:
            float(text.replace('.', '').replace('-', ''))
            return True
        except ValueError:
            return False
    
    def _filter_distractors(self, all_distractors: List[str], answer: str, num_distractors: int) -> List[str]:
        unique_distractors = []
        seen = set()
        answer_lower = answer.lower().strip()
        
        for distractor in all_distractors:
            distractor_clean = distractor.strip()
            distractor_lower = distractor_clean.lower()
            
            if (distractor_clean and 
                distractor_clean not in seen and 
                distractor_lower != answer_lower and
                len(distractor_clean) > 0):
                seen.add(distractor_clean)
                unique_distractors.append(distractor_clean)
        
        return unique_distractors[:num_distractors]
    
    
    def cleanup(self):
        if hasattr(self, 'model'):
            del self.model
        if hasattr(self, 'tokenizer'):
            del self.tokenizer
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        gc.collect()
        logger.info("Model cleanup completed")