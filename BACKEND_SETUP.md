# Quick Backend Setup Guide

## 🚀 Getting Started with FastAPI Backend

Your Yi Farishtey project now has a complete FastAPI backend! Here's how to get it running:

### 1. Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Create virtual environment (macOS/Linux)
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp env.example .env

# Edit .env with your settings
# For development, you can use the defaults
```

### 3. Start the Backend Server

```bash
# Option 1: Use the startup script
python start.py

# Option 2: Use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Option 3: Use npm scripts (from project root)
npm run backend:dev
```

### 4. Access Your API

- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### 5. Test the API

The backend includes these endpoints:

- **Users**: `/users/` - Registration, login, profile management
- **Trainings**: `/trainings/` - Training program management
- **Training Requests**: `/training-requests/` - Enrollment and approval system
- **Institutions**: `/institutions/` - Training institution management

### 6. Frontend Integration

Your React frontend is already configured to connect to the backend via the `src/services/api.js` file. The API service handles:

- Authentication with JWT tokens
- All CRUD operations
- Error handling and token refresh
- Role-based access control

### 7. Database

- **Development**: Uses SQLite by default (auto-created)
- **Production**: Configure PostgreSQL in your `.env` file

### 8. User Roles

- **user**: Basic access, view trainings, create requests
- **trainer**: Manage trainings, approve/reject requests
- **admin**: Full user and content management
- **super_admin**: Complete system access

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Change port in .env file or use different port
uvicorn main:app --reload --port 8001
```

### Import Errors
```bash
# Make sure you're in the backend directory
cd backend
python start.py
```

### Database Issues
```bash
# Initialize database tables
python -c "from database import create_tables; create_tables()"
```

## 📚 Next Steps

1. **Customize Models**: Modify `database.py` to add new fields
2. **Add New Routes**: Create new router files in `routers/`
3. **Authentication**: Customize JWT settings in `auth.py`
4. **Deployment**: Use Docker or deploy to cloud platforms

## 🎯 Development Workflow

1. Start backend: `npm run backend:dev`
2. Start frontend: `npm run dev`
3. Backend runs on port 8000
4. Frontend runs on port 5173
5. API calls automatically go to backend

Your FastAPI backend is now ready to power your Yi Farishtey application! 🚀
