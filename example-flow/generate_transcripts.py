import marimo

__generated_with = "0.12.8"
app = marimo.App(width="medium")


@app.cell
def _():
    from openai import AzureOpenAI
    from dotenv import load_dotenv
    import os

    # Load variables from .env file
    load_dotenv("./.env")

    # Access the variables
    api_key = os.getenv("API_KEY")
    azure_endpoint = os.getenv("AZURE_ENDPOINT")
    api_version = "2023-07-01-preview"

    # gets the API Key from environment variable AZURE_OPENAI_API_KEY
    client = AzureOpenAI(
        api_version=api_version,
        azure_endpoint=azure_endpoint,
        api_key=api_key,
    )

    def generate_transcript() -> str:
        completion = client.chat.completions.create(
            model="gpt-4o",  # e.g. gpt-35-instant
            messages=[
                {
                    "role": "user",
                    "content": """I need a script of conversation between a bank agent and an important customer. They are discussing something, could be retirement planning, could be investment options, etc. The script needs to contain points of emotional change in the client. At some points the client should be happy, and at some points the client should be sad / uncertain, etc.

    Generate the transcript, and annotate the parts with emotion with [] bracket followed by () bracket to indicate the emotion.

    Don't output anything else apart from the annotated transcript.

    For example: 
    Bank Agent: Good afternoon, Mr. Wilson! I reviewed your portfolio. You've built a solid foundation—[congrats!](positive, happy) 
    Mr. Wilson: Thanks. That's good to hear. I've been putting money aside for years… [just hoping it's enough](neutral, reflective).
    Bank Agent: Based on our projections, if you retire at 65, your current savings and investments should give you a very comfortable lifestyle.
    Mr. Wilson: [That's a relief](positive, relieved). [Honestly, I've been worried I'd outlive my savings](neutral, anxious).  
    Bank Agent: I understand. Though, [if healthcare costs rise or the market dips, we might need to make small adjustments](neutral, cautious).
    Mr. Wilson: [Adjustments?](negative, surprised) [I thought I was set](negative, disbelief). [Now I'm not so sure](negative, uncertain)...
    Bank Agent: [It's normal to feel that way](positive, reassuring). But we can create a flexible plan—include a cushion for those surprises, maybe stagger withdrawals, or adjust your risk exposure slightly.
    Mr. Wilson: [Okay](neutral, relieved)… that makes sense. [I just want to enjoy retirement without constantly worrying](neutral, reflective).
    Bank Agent: And you will. [With the right strategy, your retirement years can be both secure and fulfilling](positive, optimistic).
    Mr. Wilson: Alright. [Let's do it](positive, resolved).""",
                },
            ],
        )
        return completion.choices[0].message.content
    return (
        AzureOpenAI,
        api_key,
        api_version,
        azure_endpoint,
        client,
        generate_transcript,
        load_dotenv,
        os,
    )


@app.cell
def _(generate_transcript, os):
    from tqdm import tqdm
    import hashlib

    output_dir = "./generated-transcripts"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    
    for i in tqdm(range(300)):
        # Generate the transcript
        transcript = generate_transcript()

        # Create a random filename from hash of the transcript
        filename = "transcript_" + hashlib.md5(transcript.encode()).hexdigest()[:5] + ".txt"

        # Save the transcript to a text file
        with open(os.path.join(output_dir, filename), "w") as f:
            f.write(transcript)
    return f, filename, hashlib, i, output_dir, tqdm, transcript


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
