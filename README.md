# Investment Intelligence System

A multi-agent, AI-powered investment assistant built with FastAPI (backend) and React (frontend).

## 🚀 Features

### Core MVP Features
- **Smart Portfolio Management**: Institutional-grade tracking with multi-broker sync and dynamic manual uploads (CSV/Excel support for Zerodha and others).
- **AI-Powered Analysis**: Automated portfolio health checks, performance attribution, and sector exposure alerts.
- **Allocate (Capital Optimizer)**: A personalized suggestion engine that analyzes your unique holdings to suggest how to invest your next capital (e.g., ₹50,000).
- **Market Pulse**: AI-powered financial news aggregator with sentiment analysis and direct links to trusted research partners (Moneycontrol, Economic Times, etc.).
- **Jargon Decoder**: An AI financial assistant that simplifies complex financial terms and concepts in plain language.

### Technical Features
- **Multi-Agent Architecture**: Specialized AI agents for different tasks
- **Background Task Processing**: Async operations for data fetching and analysis
- **In-Memory Caching**: Fast response times for frequently accessed data
- **RESTful API**: Clean, documented endpoints
- **Modern UI**: Responsive React frontend with Tailwind CSS

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
- **FastAPI**: Modern, fast web framework for building APIs
- **MongoDB**: NoSQL database for flexible data storage
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation and settings management
- **OpenAI**: AI integration for intelligent analysis
- **yFinance**: Financial data fetching
- **BeautifulSoup**: Web scraping for news

### Frontend
- **React**: Modern UI framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching
- **Recharts**: Chart library for data visualization

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
