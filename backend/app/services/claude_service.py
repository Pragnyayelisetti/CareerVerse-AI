"""
Claude AI integration — sends career questions to Anthropic's API
and returns the model's response.
"""

import anthropic
from app.config import ANTHROPIC_API_KEY, CLAUDE_MODEL

# ── System prompt that shapes Claude into a career guidance counselor ──
SYSTEM_PROMPT = """You are CareerVerse AI — an expert, empathetic career guidance 
counselor. Your job is to help users explore career paths, understand industry 
trends, build skills roadmaps, and make informed decisions about their 
professional future.

Guidelines:
• Give actionable, specific advice — not generic platitudes.
• When relevant, suggest concrete resources (courses, certifications, tools).
• Consider the user's interests, strengths, and market demand.
• Be encouraging but honest about challenges.
• Format your answers with clear headings and bullet points for readability.
"""


async def get_career_guidance(question: str) -> str:
    """
    Call the Anthropic Messages API with the user's career question.

    Returns the text content of Claude's response.
    Raises RuntimeError if the API key is missing or the call fails.
    """
    if not ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. "
            "Add it to backend/.env  →  ANTHROPIC_API_KEY=sk-ant-..."
        )

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    message = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": question},
        ],
    )

    # Extract the text from the first content block
    return message.content[0].text
