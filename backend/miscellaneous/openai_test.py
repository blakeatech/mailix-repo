from openai import OpenAI
from app.config.settings import settings

client = OpenAI(api_key=settings.openai_api_key)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant skilled in writing professional email responses."},
        {"role": "user", "content": "What is the weather in Tokyo?"}
    ]
)