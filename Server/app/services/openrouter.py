import httpx

from ..config import settings


async def chat(messages: list, model: str = "deepseek/deepseek-v4-flash:free") -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.openrouter_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://chakra.app",
                "X-Title": "Chakra",
            },
            json={"model": model, "messages": messages},
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
