import os
import sys
import shutil
import logging
from typing import List

# Ensure the backend root directory is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from app.services.rag_service import rag_service

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("documind-api")

app = FastAPI(title="DocuMind API")

# Configure CORS dynamically for production
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins_env == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Use the resolved absolute data directory from the RAG service
DATA_DIR = rag_service.data_dir

class QueryRequest(BaseModel):
    question: str

class DocumentInfo(BaseModel):
    id: str
    name: str
    upload_date: str
    size: int

@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    logger.info(f"Received upload request for {len(files)} files")
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    uploaded_files = []
    for file in files:
        if not file.filename.endswith(".pdf"):
            logger.warning(f"Rejected non-PDF file: {file.filename}")
            continue
        
        file_path = os.path.join(DATA_DIR, file.filename)
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            uploaded_files.append(file.filename)
            logger.info(f"Successfully saved uploaded file: {file.filename}")
        except Exception as e:
            logger.error(f"Error saving file {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error saving {file.filename}: {str(e)}")
    
    # Trigger index rebuild after upload
    try:
        rag_service.rebuild_index()
        logger.info("Rebuilt vector store index successfully after upload")
    except Exception as e:
        logger.error(f"Error rebuilding index: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Rebuilding index failed: {str(e)}")
    
    return {"message": f"Successfully uploaded {len(uploaded_files)} files", "files": uploaded_files}

@app.get("/documents", response_model=List[DocumentInfo])
async def list_documents():
    logger.info("Listing all documents")
    if not os.path.exists(DATA_DIR):
        return []
    
    docs = []
    for filename in os.listdir(DATA_DIR):
        file_path = os.path.join(DATA_DIR, filename)
        if os.path.isfile(file_path) and filename.endswith(".pdf"):
            stats = os.stat(file_path)
            docs.append(DocumentInfo(
                id=filename,
                name=filename,
                upload_date=datetime.fromtimestamp(stats.st_ctime).isoformat(),
                size=stats.st_size
            ))
    return docs

@app.delete("/documents/{filename}")
async def delete_document(filename: str):
    logger.info(f"Received request to delete document: {filename}")
    file_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            logger.info(f"Deleted file {filename} from storage")
            # Rebuild index after deletion
            rag_service.rebuild_index()
            logger.info("Rebuilt index after document deletion")
            return {"message": f"Document {filename} deleted successfully"}
        except Exception as e:
            logger.error(f"Error deleting document {filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")
    else:
        logger.warning(f"Document not found for deletion: {filename}")
        raise HTTPException(status_code=404, detail="Document not found")

@app.post("/reindex")
async def reindex():
    logger.info("Received request to rebuild index")
    try:
        rag_service.rebuild_index()
        logger.info("Index rebuilt successfully via API")
        return {"message": "Index rebuilt successfully"}
    except Exception as e:
        logger.error(f"Error rebuilding index via API: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_rag(request: QueryRequest):
    logger.info(f"Received query request: {request.question}")
    try:
        result = rag_service.query(request.question)
        logger.info("Successfully completed RAG query")
        return result
    except Exception as e:
        logger.error(f"Error querying RAG engine: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
