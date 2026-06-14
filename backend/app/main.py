import os
import sys
import shutil
from typing import List

# Ensure the backend root directory is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from app.services.rag_service import rag_service

app = FastAPI(title="DocuMind API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.getenv("DATA_DIR", "./data")

class QueryRequest(BaseModel):
    question: str

class DocumentInfo(BaseModel):
    id: str
    name: str
    upload_date: str
    size: int

@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    uploaded_files = []
    for file in files:
        if not file.filename.endswith(".pdf"):
            continue
        
        file_path = os.path.join(DATA_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        uploaded_files.append(file.filename)
    
    # Trigger index rebuild after upload
    rag_service.rebuild_index()
    
    return {"message": f"Successfully uploaded {len(uploaded_files)} files", "files": uploaded_files}

@app.get("/documents", response_model=List[DocumentInfo])
async def list_documents():
    if not os.path.exists(DATA_DIR):
        return []
    
    docs = []
    for filename in os.listdir(DATA_DIR):
        file_path = os.path.join(DATA_DIR, filename)
        if os.path.isfile(file_path) and filename.endswith(".pdf"):
            stats = os.stat(file_path)
            docs.append(DocumentInfo(
                id=filename, # Using filename as ID for simplicity
                name=filename,
                upload_date=datetime.fromtimestamp(stats.st_ctime).isoformat(),
                size=stats.st_size
            ))
    return docs

@app.delete("/documents/{filename}")
async def delete_document(filename: str):
    file_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        # Rebuild index after deletion
        rag_service.rebuild_index()
        return {"message": f"Document {filename} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Document not found")

@app.post("/reindex")
async def reindex():
    try:
        rag_service.rebuild_index()
        return {"message": "Index rebuilt successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_rag(request: QueryRequest):
    try:
        result = rag_service.query(request.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
