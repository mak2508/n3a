import os
import sys

from models.openai_models import ModelOpenAI
from models.hf_models import ModelHF
from models.azure_models import ModelAzure

def process_audio(audio_path):
    """Returns only the GPT analysis while handling errors properly"""
    try:
        # Initialize models (with gradient_checkpointing warning suppression)
        import warnings
        from transformers import logging
        warnings.simplefilter("ignore")
        logging.set_verbosity_error()
        
        # Get transcription
        transcript = ModelOpenAI().whisper(audio_path)
        if not transcript:
            return {"error": "Empty transcription returned"}

        # Get audio events
        audio_events = ModelHF().detect_audio_events(audio_path)
        
        # Insert audio cues
        annotated_transcript = transcript
        for event in sorted(audio_events, key=lambda x: x['timestamp'], reverse=True):
            if event.get('confidence', 0) > 0.7:
                pos = min(int(event['timestamp'] * 15), len(annotated_transcript))
                annotated_transcript = (
                    f"{annotated_transcript[:pos]}"
                    f"(AUDIO_CONTEXT: {event['annotation'][2:-2]}) "
                    f"{annotated_transcript[pos:]}"
                )

        # Get and return analysis
         # Get analysis using GPT-4 with emotional annotation prompt
        analysis = ModelAzure().gpt4(
            f"""Please analyze this conversation transcript line by line. For each line:
            1. Start with the speaker's role (Bank Agent or the client's name)
            2. Follow with a colon
            3. Identify parts of the spoken text that express emotion or sentiment
            4. Wrap those emotional/sentimental parts in square brackets []. Only the specific emotional phrases, not whole sentences!
            5. Add emotional context in parentheses (sentiment, tone) after each bracketed section
            6. Remove all audio cue annotations (AUDIO_CONTEXT: ...) from the final transcript
            7. Ensure the final output contains only clean conversation text with emotional analysis

            Example format:
            Bank Agent: Good afternoon, Ms. Taylor! Thank you for coming in today. I had the chance to review your portfolio—it's looking solid overall. [You've done a great job managing your finances so far](positive, encouraging).

            Ms. Taylor: Thanks. [That's good to hear](positive, relieved). But, if I'm honest, I still feel uncertain about whether I'm truly prepared for retirement. [I keep worrying... what if I haven't saved enough?](negative, anxious)

            Maintain natural conversation flow while marking specific emotional expressions with [] and their interpretations with (). Return only the formatted analysis without any additional commentary or headers.{transcript}"""
        )
        
        return analysis

    except Exception as e:
        return {"error": str(e)}

def main():
    if len(sys.argv) != 2:
        print("Usage: python main.py <audio_file_path>", file=sys.stderr)
        sys.exit(1)
        
    audio_path = sys.argv[1]
    result = process_audio(audio_path)
    print(result)

if __name__ == "__main__":
    main()