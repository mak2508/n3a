from transformers import pipeline
from typing import List, Dict, Any, Optional
import os

class ModelHF:
    def __init__(self):
        """Initialize HuggingFace pipelines for audio and text analysis"""
        api_key = os.getenv("HF_API_KEY")
        if not api_key:
            raise ValueError("HF_API_KEY environment variable is not set")
            
        # Initialize sentiment analysis pipeline for text
        self.sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
            token=api_key
        )
        
        # Initialize enhanced audio analysis pipelines
        self.audio_emotion_pipeline = pipeline(
            "audio-classification",
            model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition",
            token=api_key
        )
        
        self.audio_prosody_pipeline = pipeline(
            "audio-classification",
            model="MIT/ast-finetuned-audioset",
            token=api_key
        )
        
        self.audio_pipeline = pipeline(
            "audio-classification",
            model="MIT/ast-finetuned-speech-commands-v2",
            token=api_key
        )

    def analyze_text_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text using HuggingFace pipeline
        
        Args:
            text (str): Text to analyze
            
        Returns:
            Dict[str, Any]: Dictionary containing sentiment score and label
            
        Raises:
            Exception: If there's an error during sentiment analysis
        """
        try:
            result = self.sentiment_pipeline(text)[0]
            # Convert score to percentage (0-100)
            sentiment_score = int(float(result['score']) * 100)
            return {
                'sentiment': sentiment_score,
                'label': result['label']
            }
        except Exception as e:
            raise Exception(f"Error analyzing text sentiment: {str(e)}")

    def analyze_audio_sentiment(self, audio_path: str) -> Dict[str, Any]:
        """Analyze sentiment/emotion from audio using enhanced HuggingFace pipelines
        
        Args:
            audio_path (str): Path to the audio file
            
        Returns:
            Dict[str, Any]: Dictionary containing detailed audio analysis including emotions,
                           prosodic features, and speech characteristics
            
        Raises:
            FileNotFoundError: If the audio file doesn't exist
            Exception: For other processing errors
        """
        try:
            if not os.path.exists(audio_path):
                raise FileNotFoundError(f"Audio file not found: {audio_path}")

            # Get emotion classification results
            emotion_result = self.audio_emotion_pipeline(audio_path)
            prosody_result = self.audio_prosody_pipeline(audio_path)
            speech_result = self.audio_pipeline(audio_path)
            
            # Process emotion results
            emotion_score = int(float(emotion_result[0]['score']) * 100)
            
            # Combine all analysis results
            return {
                'sentiment': emotion_score,
                'emotion': {
                    'primary': emotion_result[0]['label'],
                    'confidence': emotion_score,
                    'all_emotions': [
                        {
                            'label': r['label'],
                            'confidence': int(float(r['score']) * 100)
                        } for r in emotion_result
                    ]
                },
                'prosody': {
                    'features': [
                        {
                            'label': r['label'],
                            'confidence': int(float(r['score']) * 100)
                        } for r in prosody_result
                    ]
                },
                'speech_characteristics': {
                    'primary': speech_result[0]['label'],
                    'all_characteristics': [
                        {
                            'label': r['label'],
                            'confidence': int(float(r['score']) * 100)
                        } for r in speech_result
                    ]
                }
            }
        except FileNotFoundError as e:
            raise e
        except Exception as e:
            raise Exception(f"Error analyzing audio sentiment: {str(e)}")

    def analyze_transcript_segments(self, segments: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Analyze sentiment for each segment in a transcript
        
        Args:
            segments (List[Dict[str, str]]): List of transcript segments with text
            
        Returns:
            List[Dict[str, Any]]: List of sentiment analysis results for each segment
            
        Raises:
            Exception: If there's an error processing any segment
        """
        try:
            results = []
            for segment in segments:
                sentiment_result = self.analyze_text_sentiment(segment['text'])
                results.append({
                    'timestamp': segment.get('timestamp', ''),
                    'text': segment['text'],
                    'sentiment': sentiment_result['sentiment'],
                    'label': sentiment_result['label']
                })
            return results
        except Exception as e:
            raise Exception(f"Error analyzing transcript segments: {str(e)}")