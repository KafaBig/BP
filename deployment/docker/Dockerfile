FROM node:18-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY src/ ./src/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

RUN npm run build

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY config.py .
COPY models/ ./models/
COPY routes/ ./routes/
COPY services/ ./services/
COPY utils/ ./utils/
COPY quiz_results/ ./quiz_results/
COPY downloaded_model/ ./downloaded_model/

COPY --from=frontend-builder /app/dist ./dist

RUN mkdir -p logs data

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "app:app"]