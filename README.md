# Investment Intelligence System

A multi-agent, AI-powered investment assistant built with FastAPI (backend) and React (frontend).

## 🚀 Features

### Core Intelligence Features
- **Institutional-Grade Portfolio Tracking**: Multi-broker sync and dynamic manual uploads. Supports combining multiple CSV/Excel/PDF statements into a unified view.
- **Advanced File Management**: Track holdings by individual upload source. Delete specific files to re-calculate your portfolio instantly.
- **Autonomous Geopolitical Intelligence**: A multi-agent chain that independently gathers world news, maps it to your specific holdings, and performs a self-correction loop to ensure high-accuracy strategic insights.
- **Agentic Reasoning Trace**: Visualize the AI's "thought process" on the dashboard, showing exactly how the agents collaborated to reach their conclusions.
- **Self-Correction Logic**: Built-in "Critic" agents that audit initial analysis for logical consistency and professional depth before presenting it to the user.
- **Jargon Decoder**: An interactive AI assistant that simplifies complex financial terminology in plain language.

### Technical Features
- **Agentic Orchestration Framework**: A custom-built reasoning engine that supports deterministic multi-step chains (e.g., Analysis -> Critique -> Refinement) without the overhead of external graph libraries.
- **Asynchronous Data Processing**: Real-time market data fetching and background analysis using FastAPI's async capabilities.
- **Secure JWT Authentication**: Full user management system with secure session handling.
- **Premium UI/UX**: High-performance dashboard built with React, Framer Motion for micro-animations, and a sleek modern aesthetic.

## 📁 Project Structure

```
Investment_Intelligence/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── agents/            # AI agents
│   │   │   ├── base_agent.py
│   │   │   ├── portfolio_agent.py
│   │   │   ├── analysis_agent.py
│   │   │   ├── news_agent.py
│   │   │   ├── jargon_agent.py
│   │   │   └── orchestrator.py
│   │   ├── config/            # Configuration
│   │   │   └── settings.py
│   │   ├── db/               # Database setup
│   │   │   └── database.py
│   │   ├── models/            # MongoDB models
│   │   │   ├── user.py
│   │   │   ├── portfolio.py
│   │   │   ├── market_data.py
│   │   │   ├── analysis.py
│   │   │   └── news.py
│   │   ├── routers/           # API endpoints
│   │   │   ├── portfolio.py
│   │   │   ├── analysis.py
│   │   │   ├── news.py
│   │   │   ├── jargon.py
│   │   │   ├── recommendations.py
│   │   │   └── tasks.py
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── tools/            # External API tools
│   │   ├── utils/            # Utilities (cache, background tasks)
│   │   └── main.py           # FastAPI app
│   └── requirements.txt
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # React context
│   │   └── utils/          # Utilities
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework.
- **MongoDB & Motor**: Asynchronous NoSQL database integration.
- **Google Generative AI (Gemini)**: Powering all multi-agent intelligence and analysis.
- **Pydantic v2**: Robust data validation and settings management.
- **PyJWT**: Secure authentication and session management.
- **BeautifulSoup4 & Feedparser**: Advanced scraping and RSS intelligence.

### Frontend
- **React 18**: Modern component-based architecture.
- **TypeScript**: Full type-safety across the application.
- **Tailwind CSS**: Professional, utility-first styling.
- **Framer Motion**: Smooth, institutional-grade animations and transitions.
- **Lucide React**: Clean and consistent iconography.
- **Axios**: Promised-based HTTP client for API communication.

### Infrastructure
- **In-Memory Caching**: Simple caching solution for MVP
- **Background Tasks**: Async task processing with FastAPI
- **Environment Configuration**: Secure settings management

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud)
- Google Gemini API key (free at https://aistudio.google.com/app/apikey)

### Backend Setup

1. **Using the Quick Start Script (Recommended)**
Open your terminal in the `backend` directory, activate your virtual environment, and run the Python script:
```bash
cd backend
python run_backend.py
```
This script will automatically install missing dependencies (`pip install -r requirements.txt`) and start the FastAPI server.

2. **Manual Setup**

**Install dependencies**
```bash
cd backend
# Activate your virtual environment first
pip install -r requirements.txt
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (update .env with connection string)
```

5. **Run the backend manually**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start the development server**
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Portfolio Management
- `POST /api/v1/portfolio/` - Create portfolio
- `GET /api/v1/portfolio/` - Get user portfolios
- `GET /api/v1/portfolio/{id}` - Get specific portfolio
- `POST /api/v1/portfolio/{id}/holdings` - Add holding

#### Analysis
- `POST /api/v1/analysis/portfolio/{id}` - Analyze portfolio
- `GET /api/v1/analysis/portfolio/{id}/performance` - Get performance metrics
- `GET /api/v1/analysis/portfolio/{id}/risk` - Get risk analysis

#### News
- `GET /api/v1/news/latest` - Get latest news
- `GET /api/v1/news/portfolio/{id}` - Get portfolio-relevant news
- `GET /api/v1/news/geopolitics` - Get geopolitical news and portfolio impact

#### Jargon Explainer
- `POST /api/v1/jargon/explain` - Explain financial term
- `POST /api/v1/jargon/ask` - Ask financial question

#### Background Tasks
- `POST /api/v1/tasks/market-data/fetch` - Fetch market data
- `POST /api/v1/tasks/portfolio/{id}/analyze` - Start portfolio analysis
- `GET /api/v1/tasks/task/{id}` - Get task status

## 🤖 AI Agents

The system uses a multi-agent architecture:

### PortfolioAgent
- Manages portfolio operations
- Handles holdings and valuations
- Calculates portfolio metrics

### AnalysisAgent
- Performs portfolio analysis
- Risk assessment and capital optimization (Allocate feature)
- Performance metrics calculation

### NewsAgent
- Fetches and filters financial news
- Sentiment analysis
- Portfolio-relevant news curation

### JargonAgent
- Explains financial terms
- Context-aware definitions
- Simple language explanations

### Orchestrator
- Coordinates between agents
- Handles multi-agent workflows
- Routes user requests

## 💰 Solutions & Pricing

The platform offers consolidated pricing tiers for various user profiles:
- **Retail**: Perfect for individual investors needing AI-powered portfolio healthcare.
- **Enterprise**: Institutional-grade tools for corporate treasuries and large portfolios.
- **Family Office**: Strategic wealth tracking and allocation for multi-generational wealth.

## 🔧 Configuration

### Environment Variables

```env
# App Settings
APP_NAME="Investment Intelligence API"
DEBUG=false

# Database
MONGODB_URL="mongodb://localhost:27017"
DATABASE_NAME="investment_intelligence"

# Security
SECRET_KEY="your-secret-key-change-in-production"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL="gemini-pro"

# External APIs
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
NEWS_API_KEY="your-news-api-key"

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]
```

## 🧪 Development

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Code Quality
```bash
# Backend linting
cd backend
flake8 app/
black app/

# Frontend linting
cd frontend
npm run lint
```

## 📈 Production Considerations

For production deployment, consider:

1. **Database**: Use MongoDB Atlas or managed MongoDB
2. **Caching**: Replace in-memory cache with Redis
3. **Background Tasks**: Consider Celery with Redis for complex workflows
4. **Security**: Implement proper authentication and authorization
5. **Monitoring**: Add logging, metrics, and error tracking
6. **Scaling**: Containerize with Docker and use load balancers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:
- Create an issue on GitHub
- Check the API documentation
- Review the code comments

---

**Note**: This is an MVP implementation. For production use, additional security, testing, and infrastructure considerations are recommended.
