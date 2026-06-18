# Use a slim Python 3.11 image
FROM python:3.11-slim

# Install system dependencies needed for compiling packages (e.g. PyMuPDF)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app codebase
COPY app/ ./app/

# Create folders for persistent volume mount
RUN mkdir -p /app/data /app/storage

# Expose port (FastAPI defaults to port 8000 but dynamic port from $PORT environment is preferred on Railway)
EXPOSE 8000

# Set environment variables
ENV PORT=8000
ENV PYTHONPATH=/app

# Start the uvicorn server binding dynamically to host and port
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
