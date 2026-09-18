from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

class LLMClient:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("OPENAI_MODEL", "gpt-4")
    
    async def chat(self, message: str, context: str = "") -> str:
        """Chat with the AI tutor"""
        system_prompt = """You are an AI Learning Assistant for LearnX, an educational platform. 
        Your role is to help students understand concepts, answer questions, and provide explanations.
        Be clear, concise, and educational. Use examples when helpful.
        If you don't know something, admit it and suggest where the student might find the answer."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {message}"}
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I apologize, but I'm having trouble connecting right now. Please try again later."
    
    async def explain(self, topic: str) -> str:
        """Explain a topic simply"""
        system_prompt = """You are an expert educator. Explain the given topic in simple, easy-to-understand terms.
        Start with a brief overview, then break it down into key points.
        Use analogies if helpful. Keep it conversational and engaging."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Explain: {topic}"}
                ],
                temperature=0.7,
                max_tokens=600
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM Error: {e}")
            return f"Here's a simple explanation of {topic}: [AI service unavailable]"
    
    async def generate_questions(self, topic: str, count: int = 5) -> List[dict]:
        """Generate practice questions for a topic"""
        system_prompt = """You are an educational content creator. Generate practice questions for the given topic.
        Return a JSON array of questions with the following structure:
        [
            {
                "question": "question text",
                "options": ["option1", "option2", "option3", "option4"],
                "correctAnswer": 0,
                "explanation": "explanation of why this is correct"
            }
        ]
        Make questions challenging but fair. Include explanations."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Generate {count} practice questions about: {topic}"}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            import json
            content = response.choices[0].message.content
            # Try to parse JSON from response
            try:
                return json.loads(content)
            except:
                # Fallback if JSON parsing fails
                return []
        except Exception as e:
            print(f"LLM Error: {e}")
            return []
    
    async def summarize(self, content: str) -> str:
        """Summarize content"""
        system_prompt = """You are an expert summarizer. Create a clear, concise summary of the given content.
        Highlight the main points and key takeaways. Use bullet points for clarity."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Summarize this:\n\n{content}"}
                ],
                temperature=0.5,
                max_tokens=400
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM Error: {e}")
            return "Summary service unavailable"

# Global LLM client instance
llm_client = LLMClient()
