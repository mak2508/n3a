import os
import sys

from models.openai_models import ModelOpenAI
from models.hf_models import ModelHF
from models.azure_models import ModelAzure

def initialize_models():
    """Initialize models with warning suppression"""
    import warnings
    from transformers import logging
    warnings.simplefilter("ignore")
    logging.set_verbosity_error()

def audio2text(audio_path):
    """Convert audio to text using OpenAI's Whisper"""
    transcript = ModelOpenAI().whisper(audio_path)
    if not transcript:
        raise ValueError("Empty transcription returned")
    return transcript

def audio2annotations(audio_path):
    """Detect audio events using HuggingFace model"""
    return ModelHF().detect_audio_events(audio_path)

def annotations2analysis(transcript, audio_events):
    """Annotate transcript with audio events and analyze with GPT-4"""
    annotated_transcript = transcript
    for event in sorted(audio_events, key=lambda x: x['timestamp'], reverse=True):
        if event.get('confidence', 0) > 0.7:
            pos = min(int(event['timestamp'] * 15), len(annotated_transcript))
            annotated_transcript = (
                f"{annotated_transcript[:pos]}"
                f"(AUDIO_CONTEXT: {event['annotation'][2:-2]}) "
                f"{annotated_transcript[pos:]}"
            )
    
    return ModelAzure().gpt4(
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

def analyze_dos_and_donts(text: str) -> dict:
    prompt = f"""Here is an interaction between a bank agent and an important client. It has segments (marked with square bracket: []) that are annotated with sentiments (written in parentheses right after the square brackets). Give a list of DO's and DONT's the bank agent should follow in future interactions with this client that can be derived from this interaction, in order to maximise positive sentiments and minimise negative sentiments. Here is an example input and output:
    INPUT:
    Bank Agent: Good afternoon, Ms. Carter! Thank you for coming in today. I've reviewed your financial profile, and we have several options to discuss for your retirement planning. [You've done an excellent job saving](positive, encouraging).
    Ms. Carter: Thank you. [I've worked hard to build my nest egg over the years](neutral, reflective). But, [I still worry—will it really be enough?](negative, uncertain).
    
    Bank Agent: That's a common concern. Based on your savings and investments, [you're in better shape than most people your age](positive, reassuring). If we take a strategic approach, I'm confident we can make your money work for you throughout retirement.
    Ms. Carter: [That's good to hear](positive, relieved). [But what about unexpected costs—healthcare, emergencies?](neutral, uneasy).
    
    Bank Agent: Good point. Healthcare and inflation can be uncertain factors. [If we allocate a portion of your portfolio to conservative, lower-risk options, we build a safety net for those scenarios](neutral, strategic).
    Ms. Carter: [Lower-risk sounds reasonable](neutral, thoughtful). [But wouldn't that mean slower growth in my investments?](negative, hesitant).
    
    Bank Agent: It might, but balance is key. [For example, leaving some of your portfolio in higher-growth investments ensures steady growth while maintaining the safety net](positive, explaining). Plus, we can schedule regular portfolio reviews to adjust based on market conditions or any changing needs you have.
    Ms. Carter: [That makes sense](positive, accepting). [Still, it feels like there's so much out of my control](negative, uncertain).
    
    Bank Agent: [I understand how you feel](positive, empathetic). Retirement planning can be uncertain. But, by creating a plan with flexibility and contingencies, [we can give you peace of mind and confidence in your financial future](positive, calming).
    Ms. Carter: [I appreciate that](positive, grateful). Still… [what if I live longer than expected? What if my savings run out?](negative, anxious).
    
    Bank Agent: That's an important concern. [With annuities or investments that provide steady income over time, we can ensure you don't outlive your savings](neutral, practical). And planning for longevity means adjusting your withdrawal rates carefully to stretch your funds long-term.
    Ms. Carter: [I feel better hearing that](positive, relieved). [But it's a lot to think about](neutral, overwhelmed).  
    
    Bank Agent: It is, but [you're not alone in this—we'll guide you every step of the way](positive, supportive). Once we complete the plan, [you'll feel confident about your ability to enjoy retirement without constant worry](positive, hopeful).  
    Ms. Carter: [Thank you... that's what I need](positive, trusting). [I just want to feel secure enough to relax and enjoy this next chapter of life](neutral, reflective).  
    
    Bank Agent: And you will. [With the right strategy and regular adjustments, we'll ensure your retirement years are not just secure but fulfilling](positive, optimistic).  
    Ms. Carter: [Alright, let's get started on the plan](positive, determined).  
    
    OUTPUT:
    Do's:
    - Acknowledge and validate concerns with empathy ("I understand how you feel")
    - Provide reassuring comparisons ("you're in better shape than most people your age")
    - Use clear and calming language ("once we complete the plan, you'll feel confident")
    
    Don'ts:
    - Don't focus only on technical advice without linking to emotional reassurance
    - Avoid information overload
    - Don't rush the client
    
    It's important the do's and don'ts are concise, and that there is only 2-3 of them.
    
    Now here is the transcript I want you to do the same for, only generate the output as above:
    {text}"""
    
    response = ModelAzure().gpt4(prompt.format(TRANSCRIPT=text))
    out_lines = response.split("\n")
    dos = []
    donts = []
    append_dos = True
    for line in out_lines:
        if "Do's:" in line:
            append_dos = True
            continue
        elif "Don'ts:" in line:
            append_dos = False
            continue
        if line.strip():
            line = line.strip()
            if line.startswith("-"):
                line = line[1:].strip()
            if append_dos:
                dos.append(line)
            else:
                donts.append(line.strip())
    return {"dos": dos, "donts": donts}

def process_audio(audio_path):
    """Process audio file through the entire pipeline"""
    try:
        initialize_models()
        transcript = audio2text(audio_path)
        audio_events = audio2annotations(audio_path)
        analysis = annotations2analysis(transcript, audio_events)
        dos_donts = analyze_dos_and_donts(analysis)
        return dos_donts
    except Exception as e:
        return {"error": str(e)}

# def main():
#     if len(sys.argv) != 2:
#         print("Usage: python main.py <audio_file_path>", file=sys.stderr)
#         sys.exit(1)
        
#     audio_path = sys.argv[1]
#     result = process_audio(audio_path)
#     print(result)

# if __name__ == "__main__":
#     main()