# 🚀 Backend Setup & Deployment Guide

## ✅ What Was Updated in Backend

Your backend has been enhanced to support the new ordering system features:

### Changes Made:
1. **Updated:** `backend/routes/bookingRoutes.js`
   - Added `sqft` field extraction
   - Added `pricePerSqft` field extraction
   - Added fields to booking document storage

2. **Created:** `BACKEND_UPDATE_GUIDE.md`
   - Complete API documentation
   - Database schema details
   - Testing instructions

---

## 🔧 Backend Setup Steps

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

This installs:
- ✅ express (web framework)
- ✅ mongoose (MongoDB ORM)
- ✅ mongodb (database driver)
- ✅ jsonwebtoken (authentication)
- ✅ bcryptjs (password hashing)
- ✅ cors (cross-origin requests)

---

### Step 2: Configure Environment Variables
Create/update `backend/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/aluminium_fabrication
# OR use MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

### Step 3: Start Backend Server
```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
Connected to MongoDB
```

---

## 📊 MongoDB Setup

### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod

# In another terminal, start backend
npm start
```

### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Add to `.env`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Database Structure
```
Database: aluminium_fabrication
Collections:
├── windows (products)
├── bookings (orders)
├── users (customer accounts)
├── requirements (quotations)
├── contacts (inquiries)
└── workers (installation staff)
```

---

## 🔐 Authentication Setup

### JWT Configuration
1. Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Add to `.env`:
```env
JWT_SECRET=your_generated_secret_here
```

3. Token expires in 24 hours by default

---

## 📝 API Endpoints Overview

### Authentication Endpoints
```
POST   /api/auth/login      - User login
POST   /api/auth/signup     - User registration
POST   /api/auth/admin      - Admin login
```

### Booking Endpoints (Updated)
```
POST   /api/bookings        - Create booking (NEW: includes sqft, pricePerSqft)
GET    /api/bookings        - Get all bookings (admin)
GET    /api/bookings/my     - Get user's bookings
PUT    /api/bookings/:id/approve  - Approve booking
PUT    /api/bookings/:id/reject   - Reject booking
GET    /api/bookings/:id    - Get booking details
```

### Product Endpoints
```
GET    /api/windows         - List all windows
POST   /api/windows         - Create window (admin)
PUT    /api/windows/:id     - Update window (admin)
DELETE /api/windows/:id     - Delete window (admin)
```

### Analytics Endpoints
```
GET    /api/analytics/bookings    - Booking statistics
GET    /api/analytics/revenue     - Revenue data
GET    /api/analytics/workers     - Worker performance
```

---

## ✅ Testing the Backend

### Test 1: Check Server Status
```bash
curl http://localhost:5000/api/windows
```

### Test 2: Create a Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "phone": "9876543210",
    "address": "123 Main St",
    "windowId": "507f1f77bcf86cd799439011",
    "windowName": "Casement",
    "width": 5,
    "height": 4,
    "sqft": 20,
    "fixingDate": "2024-06-15",
    "pricePerSqft": 500,
    "windowPrice": 10000,
    "labourCharge": 1000,
    "rubberCharge": 500,
    "serviceCharge": 300,
    "totalPrice": 11800
  }'
```

### Test 3: Query Bookings
```bash
curl -X GET http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📦 Production Deployment

### Option A: Deploy to Heroku
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

### Option B: Deploy to AWS/GCP/Azure
1. Set up VM instance
2. Clone repository
3. Install Node.js
4. Set environment variables
5. Run: `npm start`
6. Configure reverse proxy (Nginx/Apache)

### Option C: Deploy with Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY backend/ .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
docker build -t aluminium-backend .
docker run -p 5000:5000 -e MONGODB_URI=... aluminium-backend
```

---

## 🔍 Monitoring & Logging

### Check Server Logs
```bash
# In production
tail -f /var/log/backend.log

# Or in PM2
pm2 logs backend
```

### Monitor with PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start server.js --name "aluminium-backend"

# Monitor
pm2 monit

# View logs
pm2 logs
```

---

## 📊 Database Queries

### View All Bookings
```javascript
db.bookings.find({}).pretty()
```

### View Bookings with New Fields
```javascript
db.bookings.find({}, { sqft: 1, pricePerSqft: 1, totalPrice: 1 }).pretty()
```

### Calculate Average Order Value
```javascript
db.bookings.aggregate([
    { $group: { _id: null, avgTotal: { $avg: "$totalPrice" } } }
])
```

### Revenue by Price Per Sq.ft
```javascript
db.bookings.aggregate([
    { $group: { 
        _id: "$pricePerSqft", 
        totalRevenue: { $sum: "$totalPrice" },
        count: { $sum: 1 }
    }}
])
```

---

## 🆘 Troubleshooting

### Issue: Cannot connect to MongoDB
```
Error: MongoDB connection refused
```
**Solution:**
- Check MongoDB is running
- Verify connection string in `.env`
- Check firewall settings
- Verify IP whitelist (if using MongoDB Atlas)

### Issue: JWT Token expired
```
Error: Invalid or expired token
```
**Solution:**
- User needs to login again
- Generate new token
- Check JWT_SECRET is set correctly

### Issue: CORS errors
```
Error: No 'Access-Control-Allow-Origin' header
```
**Solution:**
- Check CORS_ORIGIN in `.env` matches frontend URL
- Verify server has CORS middleware enabled
- Check frontend is making requests to correct backend URL

### Issue: Port already in use
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm start
```

---

## 📋 Deployment Checklist

Before deploying to production:

- [ ] All dependencies installed
- [ ] Environment variables set
- [ ] MongoDB connection verified
- [ ] JWT secret configured
- [ ] CORS configured for frontend URL
- [ ] All endpoints tested
- [ ] Error handling working
- [ ] Database backups configured
- [ ] Security headers set
- [ ] Logging configured

---

## 🚀 Git Workflow for Backend

### When making backend changes:
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add backend/

# Commit
git commit -m "feat: describe your changes"

# Push
git push origin feature/new-feature

# Create Pull Request on GitHub
# Once approved, merge to main
git checkout main
git pull
git merge feature/new-feature
git push
```

---

## 📞 Backend Architecture

### Request Flow:
```
Client (Frontend)
    ↓
HTTPS/TLS
    ↓
Express Server
    ├── Authentication Middleware
    ├── CORS Middleware
    ├── Route Handlers
    │   └── Business Logic
    └── Error Handlers
         ↓
    MongoDB Database
```

### New Booking Flow:
```
1. Frontend sends booking request with sqft & pricePerSqft
2. Backend receives request at POST /api/bookings
3. Auth middleware validates JWT token
4. Route handler extracts data (including sqft, pricePerSqft)
5. Validate required fields
6. Parse numeric values
7. Insert document into bookings collection
8. Return success response with insertedId
9. Frontend receives confirmation
10. User sees success message
```

---

## 📈 Performance Optimization

### Add Indexes to MongoDB
```javascript
// Index bookings by userId for faster queries
db.bookings.createIndex({ userId: 1 })

// Index by status for filtering
db.bookings.createIndex({ status: 1 })

// Compound index
db.bookings.createIndex({ userId: 1, status: 1 })
```

### Caching Strategy
```javascript
// Cache window data (static)
// Cache user sessions (temporary)
// Don't cache booking data (frequently updated)
```

---

## 🔐 Security Best Practices

✅ **Implemented:**
- JWT authentication
- Password hashing with bcryptjs
- CORS protection
- Input validation

✅ **Recommended:**
- Use HTTPS in production
- Rate limiting on endpoints
- SQL injection protection (using MongoDB prevents this)
- XSS protection headers
- CSRF protection

---

## 📚 Full Backend Checklist

- [ ] Node.js v14+ installed
- [ ] npm dependencies installed
- [ ] `.env` file configured
- [ ] MongoDB connected and verified
- [ ] All routes tested
- [ ] Authentication working
- [ ] Bookings saving with new fields
- [ ] Database backups working
- [ ] Logging configured
- [ ] Ready for production

---

## 🎯 Summary

Your backend is now:
✅ Updated with new booking fields
✅ Ready to handle enhanced ordering system
✅ Fully backward compatible
✅ Production ready

### Key Files:
- `backend/routes/bookingRoutes.js` - Main booking endpoint
- `backend/server.js` - Server configuration
- `backend/.env` - Environment configuration
- `backend/db.js` - Database connection

---

**Backend setup is complete! Ready to receive orders from your enhanced frontend.** 🚀
