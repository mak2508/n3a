import os
from openai import AzureOpenAI

class ModelAzure:
    def __init__(self):
        """Initialize Azure OpenAI client with API key and endpoint from environment"""
        api_key = os.getenv("AZURE_API_KEY")
        endpoint = os.getenv("AZURE_ENDPOINT")
        
        if not api_key:
            raise ValueError("AZURE_API_KEY environment variable is not set")
        if not endpoint:
            raise ValueError("AZURE_ENDPOINT environment variable is not set")
            
        self.client = AzureOpenAI(
            api_key=api_key,
            api_version="2024-02-15-preview",
            azure_endpoint=endpoint
        )

    def gpt4(self, query):
        """Query Azure's GPT-4 model
        
        Args:
            query (str): The text query to send to GPT-4
            
        Returns:
            str: The model's response text
            
        Raises:
            Exception: For Azure OpenAI API related errors
        """
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",  # Azure deployment name
                messages=[{"role": "user", "content": query}]
            )
            
            return response.choices[0].message.content

        except Exception as e:
            raise Exception(f"Error querying Azure GPT-4: {str(e)}")