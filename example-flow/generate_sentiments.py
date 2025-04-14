import marimo

__generated_with = "0.12.8"
app = marimo.App(width="medium")


@app.cell
def _():
    import pandas as pd
    return (pd,)


@app.cell
def _(pd):
    df = pd.read_csv("./1-meeting-transcript.csv")
    return (df,)


@app.cell
def _(df):
    transcript = (df["speaker"]  + ": " + df["text"] + "\n").sum()
    return (transcript,)


@app.cell
def _(find_sentiments, transcript):
    print(find_sentiments(transcript))
    return


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

    def find_sentiments(text: str) -> str:
        completion = client.chat.completions.create(
            model="gpt-4o",  # e.g. gpt-35-instant
            messages=[
                {
                    "role": "user",
                    "content": f"Take a look at the following transcript. Output exactly the same text, but add a sentiment label to any text portion where the speaker seems to be expressing a sentiment. The sentiment can be labels like 'positive', 'negative', 'neutral', with more fine-grained classes being things like 'happy', 'sad', 'angry', 'excited', 'bored', etc. So we will output both the umbrella sentiment and the finer sentiment. The sentiment label should be added at the end of the text portion, in parentheses, in the form (umbrella sentiment, finer sentiment). Here is the transcript:\n\n{text}",
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
        find_sentiments,
        load_dotenv,
        os,
    )


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
