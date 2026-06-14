import os
from llama_index.core import (
    VectorStoreIndex, 
    SimpleDirectoryReader, 
    StorageContext, 
    load_index_from_storage,
    Settings
)
from llama_index.llms.huggingface_api import HuggingFaceInferenceAPI
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from dotenv import load_dotenv

load_dotenv()

class RAGService:
    def __init__(self):
        self.hf_token = os.getenv("HF_TOKEN")
        self.model_id = os.getenv("MODEL_ID", "meta-llama/Llama-3.1-8B-Instruct")
        self.embed_model_id = os.getenv("EMBED_MODEL_ID", "all-MiniLM-L6-v2")
        
        # Resolve data and storage directories relative to the backend root
        backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
        
        data_dir_env = os.getenv("DATA_DIR", "./data")
        if os.path.isabs(data_dir_env):
            self.data_dir = data_dir_env
        else:
            self.data_dir = os.path.abspath(os.path.join(backend_root, data_dir_env))
            
        storage_dir_env = os.getenv("STORAGE_DIR", "./storage")
        if os.path.isabs(storage_dir_env):
            self.storage_dir = storage_dir_env
        else:
            self.storage_dir = os.path.abspath(os.path.join(backend_root, storage_dir_env))
        
        self._setup_settings()
        self.index = self._load_or_create_index()

    def _setup_settings(self):
        Settings.llm = HuggingFaceInferenceAPI(
            model_name=self.model_id,
            token=self.hf_token,
            max_new_tokens=1024,
            temperature=0.1,
        )
        Settings.embed_model = HuggingFaceEmbedding(
            model_name=self.embed_model_id
        )

    def _load_or_create_index(self):
        if os.path.exists(self.storage_dir) and os.listdir(self.storage_dir):
            print("Loading index from storage...")
            storage_context = StorageContext.from_defaults(persist_dir=self.storage_dir)
            return load_index_from_storage(storage_context)
        else:
            print("Creating new index...")
            return self.rebuild_index()

    def rebuild_index(self):
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            
        # Check if there are any documents to index
        if not any(f.endswith('.pdf') for f in os.listdir(self.data_dir)):
            print("No PDF documents found in data directory. Creating an empty index.")
            # Create a placeholder document to avoid index creation error if needed
            # or just return None and handle it in query
            self.index = VectorStoreIndex.from_documents([])
            return self.index
            
        documents = SimpleDirectoryReader(self.data_dir).load_data()
        self.index = VectorStoreIndex.from_documents(documents)
        self.index.storage_context.persist(persist_dir=self.storage_dir)
        return self.index

    def query(self, question: str):
        if self.index is None or not self.index.docstore.docs:
            return {
                "answer": "No documents have been uploaded yet. Please upload documents to start querying.",
                "sources": []
            }
            
        query_engine = self.index.as_query_engine(
            similarity_top_k=5,
            response_mode="compact",
        )
        response = query_engine.query(question)
        
        sources = []
        for node in response.source_nodes:
            sources.append({
                "file": node.metadata.get("file_name", "Unknown"),
                "page": node.metadata.get("page_label", "N/A"),
                "score": float(node.score) if node.score else 0.0,
                "text": node.text
            })
            
        return {
            "answer": str(response),
            "sources": sources
        }

rag_service = RAGService()
