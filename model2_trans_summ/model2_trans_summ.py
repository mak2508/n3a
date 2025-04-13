from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

def transcribe_and_annotate(audio_file_path, meeting_info = {}):
    """
    Transcribes an audio file and annotates the transcription as a dialogue.

    Args:
        audio_file_path (str): The path to the audio file.
        meeting_info (dict): contains information about the meeting

    Returns:
        str: The annotated dialogue.
    """
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Open the audio file
    with open(audio_file_path, "rb") as audio_file:
        # Transcribe the audio
        transcription = client.audio.transcriptions.create(
            model="gpt-4o-transcribe", 
            file=audio_file, 
            response_format="text",
            prompt="The following conversation is between a banker and a client, transcribe it, and include the tone and emotion with every sentence. annotate who said the sentence",
            timestamp_granularities=["segment"]
        )

    # Prepare the annotation prompt
    annotation_prompt = f"""
    The following is a transcription of a conversation. Annotate who said each sentence (Banker or Client) and format it as a dialogue:

    {transcription}

    Output the result as a dialogue with proper formatting.
    """

    # Generate the annotated dialogue
    annotation = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that formats transcriptions into dialogues."},
            {"role": "user", "content": annotation_prompt}
        ]
    )

    # Return the annotated dialogue
    return annotation.choices[0].message.content

# Example usage
if __name__ == "__main__":
    audio_path = "./data/sample.wav"
    dialogue = transcribe_and_annotate(audio_path)
    print(dialogue)