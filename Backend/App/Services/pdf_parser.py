import io
import pdfplumber

def extract_text_from_pdf(file_bytes: bytes) -> str:
    extracted_text = ""
    with io.BytesIO(file_bytes) as pdf_file:
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
    return extracted_text.strip()
