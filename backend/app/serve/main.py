import os
import sys
from models.openai_models import ModelOpenAI
from models.azure_models import ModelAzure

def process_audio(audio_path):
    """Process audio file to get transcription and analysis
    
    Args:
        audio_path (str): Path to the audio file
        
    Returns:
        dict: Contains transcription and analysis results
        
    Raises:
        Exception: For various processing errors
    """
    try:
        # Initialize models
        openai_model = ModelOpenAI()
        azure_model = ModelAzure()
        
        # Validate file exists
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
        
        # Get transcription using Whisper
        transcript = openai_model.whisper(audio_path)
        
        # Get analysis using GPT-4 with emotional annotation prompt
        analysis = azure_model.gpt4(
            f"""Please analyze this conversation transcript line by line. For each line:
            1. Start with the speaker's role (Bank Agent or the client's name)
            2. Follow with a colon
            3. Identify parts of the spoken text that express emotion or sentiment
            4. Wrap those emotional/sentimental parts in square brackets []. Not the whole sentence only the part!
            5. Add emotional context in parentheses (sentiment, tone) after each bracketed section
            
            Example format:
            Bank Agent: Good afternoon, Ms. Taylor! Thank you for coming in today. I had the chance to review your portfolio—it's looking solid overall. [You’ve done a great job managing your finances so far](positive, encouraging).

            Ms. Taylor: Thanks. [That’s good to hear](positive, relieved). But, if I’m honest, I still feel uncertain about whether I’m truly prepared for retirement. [I keep worrying... what if I haven’t saved enough?](negative, anxious)
            
            Maintain natural conversation flow while marking specific emotional expressions with [] and their interpretations with ().
            Here's the transcript to analyze: {transcript}"""
        )
        
        return {
            "transcript": transcript,
            "analysis": analysis
        }
        
    except Exception as e:
        print(f"Error processing audio: {str(e)}", file=sys.stderr)
        sys.exit(1)

def main():
    if len(sys.argv) != 2:
        print("Usage: python main.py <audio_file_path>", file=sys.stderr)
        sys.exit(1)
        
    audio_path = sys.argv[1]
    result = process_audio(audio_path)
    
    print("\nTranscript:")
    print(result["transcript"])
    print("\nAnalysis:")
    print(result["analysis"])

if __name__ == "__main__":
    main()