import json
import os
import pdfplumber
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
  print("WARNING: GROQ_API_KEY is missing in .env file!")

client = Groq(api_key=api_key)

app = FastAPI(title="AI Resume & Job Matcher API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/parse-cv")
async def parse_cv(
    file: UploadFile = File(...), job_description: str = Form("")
):
  if not file.filename.endswith(".pdf"):
    raise HTTPException(
        status_code=400, detail="عذراً، يرجى رفع ملف بصيغة PDF فقط."
    )

  try:
    # 1. استخراج النص من PDF
    with pdfplumber.open(file.file) as pdf:
      extracted_text = ""
      for page in pdf.pages:
        text = page.extract_text()
        if text:
          extracted_text += text + "\n"

    if not extracted_text.strip():
      raise HTTPException(
          status_code=400,
          detail="لم يتم العثور على نص قابل للقراءة داخل ملف PDF.",
      )

    # 2. صياغة الـ Prompt
    prompt = f"""
        You are an expert HR Specialist and AI Recruiter. 
        Analyze the following Resume and compare it with the Job Description provided.

        Resume Text:
        {extracted_text}

        Job Description:
        {job_description if job_description.strip() else "Not Provided"}

        Return ONLY a valid raw JSON object without markdown formatting, code blocks, or preamble.
        The JSON must contain these exact keys:
        - "name": (string)
        - "email": (string)
        - "phone": (string)
        - "skills": (array of strings)
        - "match_percentage": (integer 0-100)
        - "missing_skills": (array of strings)
        - "recommendation": (string in Arabic)
        """

    # استخدام الموديل القياسي المعتمد الدائم
    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    response_content = completion.choices[0].message.content
    return json.loads(response_content)

  except Exception as e:
    print(f"Error processing CV: {str(e)}")
    raise HTTPException(status_code=500, detail=f"حدث خطأ في السيرفر: {str(e)}")


@app.get("/")
def read_root():
  return {"message": "AI Resume Matcher Backend is running successfully!"}











    