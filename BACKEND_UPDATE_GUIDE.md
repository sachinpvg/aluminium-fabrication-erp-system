# 🔧 Backend Update Guide

## ✅ What Was Updated

Your backend has been updated to handle the two new fields from the enhanced frontend:

### New Fields Added:
1. **`sqft`** (number) - Total square feet
2. **`pricePerSqft`** (number) - Price per square foot

---

## 📂 Updated Files

### Modified:
- **`backend/routes/bookingRoutes.js`** ✏️
  - Added `sqft` and `pricePerSqft` to request body extraction
  - Added `sqft` and `pricePerSqft` to booking document
  - Fields are parsed as floats with default value of 0

---

## 📊 Booking Document Schema

### Before (Old):
```javascript
{
    userId,
    userEmail,
    username,
    phone,
    address,
    windowId,
    windowName,
    width,
    height,
    fixingDate,
    notes,
    windowPrice,
    labourCharge,
    rubberCharge,
    serviceCharge,
    totalPrice,
    status,
    paymentStatus,
    createdAt
}
```

### After (New):
```javascript
{
    userId,
    userEmail,
    username,
    phone,
    address,
    windowId,
    windowName,
    width,
    height,
    sqft,              // ✅ NEW
    fixingDate,
    notes,
    pricePerSqft,      // ✅ NEW
    windowPrice,
    labourCharge,
    rubberCharge,
    serviceCharge,
    totalPrice,
    status,
    paymentStatus,
    createdAt
}
```

---

## 🚀 Backend API Endpoint

### Endpoint:
```
POST /api/bookings
```

### Required Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body:
```javascript
{
    // Customer Details
    username: "John Doe",
    phone: "9876543210",
    address: "123 Main St, City",
    
    // Product Details
    windowId: "507f1f77bcf86cd799439011",
    windowName: "Casement Window",
    width: 5,
    height: 4,
    sqft: 20,              // ✅ NEW
    
    // Pricing Details
    pricePerSqft: 500,     // ✅ NEW
    windowPrice: 10000,
    labourCharge: 1000,
    rubberCharge: 500,
    serviceCharge: 300,
    totalPrice: 11800,
    
    // Schedule
    fixingDate: "2024-06-15",
    notes: "Optional notes"
}
```

### Response:
```javascript
{
    insertedId: "ObjectId",
    message: "Booking created successfully"
}
```

---

## ✅ Backward Compatibility

✅ **Fully backward compatible:**
- Old clients (without new fields) still work
- New fields have default values (0)
- No breaking changes to existing endpoints
- Existing bookings unaffected

---

## 📝 MongoDB Document Example

A new booking document will look like:
```javascript
{
    _id: ObjectId("507f1f77bcf86cd799439012"),
    userId: "507f1f77bcf86cd799439001",
    userEmail: "john@example.com",
    username: "John Doe",
    phone: "9876543210",
    address: "123 Main St, City, State 12345",
    windowId: "507f1f77bcf86cd799439011",
    windowName: "Casement Window",
    width: 5,
    height: 4,
    sqft: 20,                           // ✅ NEW
    fixingDate: ISODate("2024-06-15"),
    notes: "Optional special request",
    pricePerSqft: 500,                  // ✅ NEW
    windowPrice: 10000,
    labourCharge: 1000,
    rubberCharge: 500,
    serviceCharge: 300,
    totalPrice: 11800,
    status: "pending",
    paymentStatus: "pending",
    createdAt: ISODate("2024-05-25"),
    approvedAt: ISODate("2024-05-26")   // (if approved)
}
```

---

## 🔄 How the Data Flows

### Frontend → Backend:
```
1. User fills form in BookingModal
   ↓
2. Form data includes sqft and pricePerSqft
   ↓
3. Submit request to /api/bookings (POST)
   ↓
4. Backend receives new fields
   ↓
5. Saves to MongoDB bookings collection
```

### Backend → Database:
```
1. Extract sqft and pricePerSqft from request
2. Parse as floats (default: 0)
3. Include in booking document
4. Insert into 'bookings' collection
```

---

## 📋 Testing the Backend

### Test with curl (in PowerShell):
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    username = "Test User"
    phone = "9876543210"
    address = "Test Address"
    windowId = "507f1f77bcf86cd799439011"
    windowName = "Casement"
    width = 5
    height = 4
    sqft = 20
    fixingDate = "2024-06-15"
    notes = "Test"
    pricePerSqft = 500
    windowPrice = 10000
    labourCharge = 1000
    rubberCharge = 500
    serviceCharge = 300
    totalPrice = 11800
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### Test with Postman:
1. Create new POST request
2. URL: `http://localhost:5000/api/bookings`
3. Headers:
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`
   - `Content-Type`: `application/json`
4. Body (raw JSON):
```json
{
  "username": "Test User",
  "phone": "9876543210",
  "address": "Test Address",
  "windowId": "507f1f77bcf86cd799439011",
  "windowName": "Casement",
  "width": 5,
  "height": 4,
  "sqft": 20,
  "fixingDate": "2024-06-15",
  "notes": "Test booking",
  "pricePerSqft": 500,
  "windowPrice": 10000,
  "labourCharge": 1000,
  "rubberCharge": 500,
  "serviceCharge": 300,
  "totalPrice": 11800
}
```

---

## ✅ Data Integrity

The backend validates:
- ✅ Required fields present (windowId, width, height, fixingDate)
- ✅ Authentication token valid
- ✅ All numeric fields parsed correctly
- ✅ Date format valid

---

## 📊 Querying Bookings

### Get all bookings (with new fields):
```javascript
db.collection('bookings').find({}).toArray()
```

### Filter by price per sqft:
```javascript
db.collection('bookings').find({ pricePerSqft: { $gt: 400 } })
```

### Filter by area:
```javascript
db.collection('bookings').find({ sqft: { $gte: 20 } })
```

---

## 🔐 Security Notes

✅ **Authentication:**
- POST /api/bookings requires JWT token
- User ID extracted from token
- Cannot book without authentication

✅ **Data Validation:**
- All numeric fields validated
- Phone number stored as-is (validate on frontend)
- Date validated as valid ISO date

---

## 📈 Analytics Considerations

When generating reports/analytics, you can now:
- Filter by price per sq.ft
- Calculate average sqft per order
- Revenue analysis by pricing tier
- Track pricing trends

---

## 🚀 Deployment Steps

### 1. Backup Current Database (Optional)
```bash
# Backup MongoDB
mongodump --uri "mongodb://..." --out ./backup
```

### 2. Deploy Backend Code
```bash
# Pull latest code
git pull origin main

# Install dependencies (if needed)
npm install

# Restart backend
npm start
```

### 3. Test New Endpoint
- Use Postman or curl to test
- Verify new fields are saved
- Check MongoDB documents

### 4. Monitor Logs
```bash
# Check backend logs for errors
tail -f backend.log
```

---

## ✨ Verification Checklist

After deployment:

- [ ] Backend starts without errors
- [ ] /api/bookings endpoint responds
- [ ] New booking can be created
- [ ] sqft field stored in database
- [ ] pricePerSqft field stored in database
- [ ] GET /api/bookings returns new fields
- [ ] User dashboard displays bookings correctly
- [ ] Admin dashboard can view new fields
- [ ] No database corruption
- [ ] All existing bookings still accessible

---

## 📞 Troubleshooting

### Issue: Bookings not saving
→ Check MongoDB connection status
→ Verify authentication token is valid
→ Check backend logs for errors

### Issue: New fields showing as null
→ Verify frontend sends sqft and pricePerSqft
→ Check request body in network tab
→ Ensure backend code is updated

### Issue: Old bookings incompatible
→ No issue - sqft and pricePerSqft default to 0
→ Old bookings still accessible
→ No migration needed

---

## 📚 Code Changes Summary

### bookingRoutes.js Changes:
```javascript
// Added to destructuring:
sqft, pricePerSqft

// Added to document:
sqft: parseFloat(sqft) || 0,
pricePerSqft: parseFloat(pricePerSqft) || 0,
```

That's all! Simple and clean integration.

---

## 🎯 Next Steps

1. **Deploy backend code** (git push already done)
2. **Restart backend server**
3. **Test with frontend**
4. **Monitor for errors**
5. **Verify in database**

---

**Backend is ready to handle the enhanced booking system!** ✅
