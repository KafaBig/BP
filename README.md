# Quiz Application

designed for model evaluation.

## Architecture

```
├── Frontend: React + TypeScript + Vite + Tailwind CSS
├── Backend:  Flask + Python
├── Deploy:   Docker + ngrok
```

## Manual Deployment

### Step 1: Build with Docker

```bash
# Build the Docker image
docker build -f deployment/docker/Dockerfile -t quiz-app .

# Run the container
docker run -p 5000:5000 quiz-app
```

### Step 2: Expose with ngrok

```bash
# In another terminal, start ngrok
ngrok http 5000
```

## Development

### Backend Development

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run Flask app
python app.py
```

### Frontend Development

```bash
# Install Node dependencies
npm install

# Run development server
npm run dev
```

## API Endpoints

```
GET  /health              # Health check
POST /start_quiz          # Start new quiz session
POST /get_all_questions   # Get all quiz questions
POST /submit_quiz         # Submit completed quiz
```

## Docker Commands

```bash
# Build image
docker build -f deployment/docker/Dockerfile -t quiz-app .

# Run container
docker run -e FLASK_ENV=production -e SECRET_KEY=00e1adba791981888830d56b84655a612add448643342d068cb718e7b808d197 -e PORT=5000 -p 5000:5000 -v ./data:/app/data quiz-app  

# View logs
docker logs <container_id>
```

## ngrok Commands

```bash
# Start tunnel
ngrok http 5000

```
