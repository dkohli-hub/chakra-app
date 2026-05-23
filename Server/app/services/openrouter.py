import httpx

from ..config import settings

DEFAULT_MODEL = "google/gemini-3.1-flash-lite-preview"
VISION_MODEL = "google/gemini-2.0-flash-exp"


async def chat(messages: list, model: str = DEFAULT_MODEL) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.openrouter_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://chakra.app",
                "X-Title": "Chakra",
            },
            json={"model": model, "messages": messages, "max_tokens": 512},
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]


async def chat_vision(prompt: str, image_base64: str, model: str = VISION_MODEL) -> str:
    messages = [{
        "role": "user",
        "content": [
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
            },
            {
                "type": "text",
                "text": prompt,
            },
        ],
    }]
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.openrouter_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://chakra.app",
                "X-Title": "Chakra",
            },
            json={"model": model, "messages": messages, "max_tokens": 1024},
            timeout=60.0,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
