import marimo

__generated_with = "0.12.8"
app = marimo.App(width="medium")


@app.cell
def _():
    import pandas as pd
    return (pd,)


@app.cell
def _(pd, summarize):
    df = pd.read_csv("./1-meeting-transcript.csv")
    df["summary"] = (df["speaker"] + ": " + df["text"] + "\n").cumsum().map(summarize)
    return (df,)


@app.cell
def _(df):
    df
    return


@app.cell
def _(df):
    out_file_name = "2-meeting-transcript-summaries.csv"
    df.to_csv(out_file_name, index=False)
    print(f"Saved to {out_file_name}")
    return (out_file_name,)


@app.cell
def _():
    from openai import AzureOpenAI
    from dotenv import load_dotenv
    import os

    # Load variables from .env file
    load_dotenv()

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

    def summarize(text: str) -> str:
        completion = client.chat.completions.create(
            model="gpt-4o",  # e.g. gpt-35-instant
            messages=[
                {
                    "role": "user",
                    "content": f"Summarize the contents of the following transcript: {text}",
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
        load_dotenv,
        os,
        summarize,
    )


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
