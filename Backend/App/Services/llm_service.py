import os
import json
from dotenv import load_dotenv, find_dotenv
from google import genai
from google.genai import types

# البحث عن ملف .env وتحميله تلقائياً من المجلد الرئيسي للمشروع
load_dotenv(find_dotenv())

# قراءة قيمة المفتاح
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("لم يتم العثور على GEMINI_API_KEY. تأكدي من وجود ملف .env داخل مجلد Backend وكتابة المفتاح بداخله.")

client = genai.Client(api_key=api_key)

def analyze_resume_with_llm(extracted_text: str):
    prompt = f"""
    You are an expert HR and resume parser. Extract the following information from the resume text in JSON format:
    - name (string)
    - email (string)
    - phone (string)
    - skills (list of strings)
    - experience_years (integer)
    - summary (string)

    Resume Text:
    {extracted_text}
    """

    response = client.models.generate_content(
        model='gemini-3.8-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    return json.loads(response.text)
