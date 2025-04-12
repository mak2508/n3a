import os
from openai import OpenAI

class ModelOpenAI:
    def __init__(self):
        """Initialize OpenAI client with API key from environment"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = OpenAI(api_key=api_key)

    def whisper(self, audio_path):
        """Transcribe audio file using OpenAI's Whisper model
        
        Args:
            audio_path (str): Path to the audio file to transcribe
            
        Returns:
            str: Transcribed text from the audio file
            
        Raises:
            FileNotFoundError: If the audio file doesn't exist
            Exception: For other OpenAI API related errors
        """
        try:
            if not os.path.exists(audio_path):
                raise FileNotFoundError(f"Audio file not found: {audio_path}")

            with open(audio_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-1"
                )
                
            return transcript.text

        except FileNotFoundError as e:
            raise e
        except Exception as e:
            raise Exception(f"Error transcribing audio: {str(e)}")