git checkout -b main

# Commit 1: Project init
git add .gitignore README.md
git commit -m "chore: initial project setup with README and gitignore"

# Commit 2: Backend base
git add backend/requirements.txt
git commit -m "chore(backend): add core dependencies"

# Commit 3: Market Data Provider
git add backend/data_market.py
git commit -m "feat(backend): implement yfinance market data ingestion"

# Commit 4: News Provider
git add backend/news_provider.py
git commit -m "feat(backend): implement waterfall news provider (Finnhub/yfinance/GNews)"

# Commit 5: Metrics & Profiling
git add backend/metrics_logger.py backend/profiling_engine.py
git commit -m "feat(backend): add session metrics logging and investor profiling engine"

# Commit 6: RAG System
git add backend/rag_retriever.py
git commit -m "feat(backend): implement TF-IDF based RAG retriever for SEBI filings"

# Commit 7: Specialist Agents
git add backend/agents_specialists.py
git commit -m "feat(backend): implement Technical, Fundamental, and Sentiment specialist AI agents"

# Commit 8: Synthesis Agent
git add backend/agents_synthesis.py
git commit -m "feat(backend): implement Synthesis master agent to orchestrate conflicts and risk profiles"

# Commit 9: API Endpoints
git add backend/main.py
git commit -m "feat(backend): expose multi-agent pipeline via FastAPI endpoints"

# Commit 10: Backend Env
git add backend/.env.example
git commit -m "chore(backend): add environment variable templates"

# Commit 11: Frontend init
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js
git commit -m "chore(frontend): initialize Vite + React project with dependencies"

# Commit 12: Frontend base
git add frontend/index.html frontend/src/main.jsx frontend/src/index.css
git commit -m "chore(frontend): set up entry points and global styling"

# Commit 13: Supabase Client
git add frontend/src/lib/supabaseClient.js
git commit -m "feat(frontend): configure Supabase client for authentication"

# Commit 14: Auth UI
git add frontend/src/components/Auth.jsx
git commit -m "feat(frontend): build custom Auth UI with login and signup flows"

# Commit 15: Landing Page
git add frontend/src/components/LandingPage.jsx
git commit -m "feat(frontend): build responsive marketing landing page with features overview"

# Commit 16: Documentation
git add frontend/src/components/Documentation.jsx
git commit -m "feat(frontend): build interactive documentation platform with Mermaid diagrams"

# Commit 17: Dashboard Core
git add frontend/src/components/Dashboard.jsx
git commit -m "feat(frontend): build financial intelligence dashboard with Recharts"

# Commit 18: App Routing
git add frontend/src/App.jsx
git commit -m "feat(frontend): implement routing and auth session protection in App root"

# Commit 19: Design Context
git add design.md "project-context (1).md"
git commit -m "docs: add UX design specifications and agent interface contracts"

# Commit 20: CI/CD
git add .github/workflows/ci.yml
git commit -m "ci: configure GitHub Actions pipeline for linting, testing, and building"

# Commit 21: Final sweep
git add .
git commit -m "fix: resolve minor integration issues and finalize hackathon build"
