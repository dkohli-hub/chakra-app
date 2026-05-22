import httpx

from ..config import settings


async def chat(messages: list, model: str = "google/gemini-3.1-flash-lite-preview") -> str:
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
