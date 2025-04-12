from openai import AzureOpenAI
from dotenv import load_dotenv
import os

prompt_template = """Here is an interaction between a bank agent and an important client. It has segments (marked with square bracket: []) that are annotated with sentiments (written in parentheses right after the square brackets). Give a list of DO's and DONT's the bank agent should follow in future interactions with this client that can be derived from this interaction, in order to maximise positive sentiments and minimise negative sentiments. Here is an example input and output:
INPUT:
Bank Agent: Good afternoon, Ms. Carter! Thank you for coming in today. I've reviewed your financial profile, and we have several options to discuss for your retirement planning. [You've done an excellent job saving](positive, encouraging).
Ms. Carter: Thank you. [I’ve worked hard to build my nest egg over the years](neutral, reflective). But, [I still worry—will it really be enough?](negative, uncertain).

Bank Agent: That’s a common concern. Based on your savings and investments, [you’re in better shape than most people your age](positive, reassuring). If we take a strategic approach, I’m confident we can make your money work for you throughout retirement.
Ms. Carter: [That’s good to hear](positive, relieved). [But what about unexpected costs—healthcare, emergencies?](neutral, uneasy).

Bank Agent: Good point. Healthcare and inflation can be uncertain factors. [If we allocate a portion of your portfolio to conservative, lower-risk options, we build a safety net for those scenarios](neutral, strategic).
Ms. Carter: [Lower-risk sounds reasonable](neutral, thoughtful). [But wouldn’t that mean slower growth in my investments?](negative, hesitant).

Bank Agent: It might, but balance is key. [For example, leaving some of your portfolio in higher-growth investments ensures steady growth while maintaining the safety net](positive, explaining). Plus, we can schedule regular portfolio reviews to adjust based on market conditions or any changing needs you have.
Ms. Carter: [That makes sense](positive, accepting). [Still, it feels like there's so much out of my control](negative, uncertain).

Bank Agent: [I understand how you feel](positive, empathetic). Retirement planning can be uncertain. But, by creating a plan with flexibility and contingencies, [we can give you peace of mind and confidence in your financial future](positive, calming).
Ms. Carter: [I appreciate that](positive, grateful). Still… [what if I live longer than expected? What if my savings run out?](negative, anxious).

Bank Agent: That’s an important concern. [With annuities or investments that provide steady income over time, we can ensure you don’t outlive your savings](neutral, practical). And planning for longevity means adjusting your withdrawal rates carefully to stretch your funds long-term.
Ms. Carter: [I feel better hearing that](positive, relieved). [But it’s a lot to think about](neutral, overwhelmed).  

Bank Agent: It is, but [you're not alone in this—we’ll guide you every step of the way](positive, supportive). Once we complete the plan, [you’ll feel confident about your ability to enjoy retirement without constant worry](positive, hopeful).  
Ms. Carter: [Thank you... that’s what I need](positive, trusting). [I just want to feel secure enough to relax and enjoy this next chapter of life](neutral, reflective).  

Bank Agent: And you will. [With the right strategy and regular adjustments, we’ll ensure your retirement years are not just secure but fulfilling](positive, optimistic).  
Ms. Carter: [Alright, let’s get started on the plan](positive, determined).  

OUTPUT:
Do's:
 - Acknowledge and validate concerns with empathy ("I understand how you feel")
 - Provide reassuring comparisons (“you’re in better shape than most people your age”)
 - Use clear and calming language ("once we complete the plan, you’ll feel confident")

Don'ts:
 - Don't focus only on technical advice without linking to emotional reassurance
 - Avoid information overload
 - Don't rush the client

It's important the do's and don'ts are concise, and that there is only 2-3 of them.

Now here is the transcript I want you to do the same for, only generate the output as above:
{TRANSCRIPT}
"""

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

def find_dos_and_donts(text: str) -> str:
    prompt = prompt_template.format(TRANSCRIPT=text)
    completion = client.chat.completions.create(
        model="gpt-4o",  # e.g. gpt-35-instant
        messages=[
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )
    output = completion.choices[0].message.content
    out_lines = output.split("\n")
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
    return dos, donts



if __name__ == "__main__":
    import sys
    import json
    text_file = sys.argv[1]
    with open(text_file, "r") as file:
        text = file.read()
    dos_and_donts = find_dos_and_donts(text)
    # Print as json
    dos = dos_and_donts[0]
    donts = dos_and_donts[1]
    combined = {
        "dos": dos,
        "donts": donts,
    }
    print(json.dumps(combined, indent=4))

