# Student Management System - Feature Documentation

## 🛡️ Duplicate Registration Prevention

### Overview
The system implements **4-layer duplicate detection** to prevent users from registering multiple times:

### Layer 1: Mobile Number Check
- **When**: During OTP send
- **Action**: Checks if mobile number already exists
- **Response**: Shows existing student name and roll number
- **Why**: Since mobile is OTP-verified, it's a strong unique identifier

### Layer 2: Roll Number Check
- **When**: During final registration
- **Action**: Ensures roll number is unique
- **Response**: "Roll number already registered"
- **Why**: Roll numbers are unique identifiers in educational systems

### Layer 3: Email Check
- **When**: During final registration
- **Action**: Ensures email is unique
- **Response**: "Email already registered"
- **Why**: Prevents account sharing

### Layer 4: Face Similarity Check
- **When**: During final registration
- **Action**: Compares face descriptor with all existing students
- **Algorithm**: Euclidean distance calculation
- **Threshold**: 0.6 (faces closer than 0.6 are considered same person)
- **Response**: Shows matched student, roll number, and similarity percentage
- **Why**: Prevents same person registering with different details

## How It Works

### Face Similarity Detection
```
1. Extract face descriptor (128-dimension vector)
2. For each existing student:
   - Calculate distance = sqrt(Σ(descriptor1[i] - descriptor2[i])²)
   - If distance < 0.6: DUPLICATE DETECTED
3. Show which existing student matches
```

### Example Scenarios

#### Scenario 1: Duplicate Mobile
```
User tries to register with mobile: 9876543210
System finds: Mobile already belongs to "John Doe (Roll: CS001)"
Result: ❌ Registration blocked at OTP stage
```

#### Scenario 2: Same Person, Different Details
```
User "John Doe" already registered as CS001
Same person tries again with:
- Different name: "Johnny D"
- Different mobile: 9999999999
- Different roll: CS999
- SAME FACE: Similarity 94%
Result: ❌ Registration blocked - "Face already registered"
Shows: "Matched with John Doe (CS001)"
```

#### Scenario 3: Legitimate Registration
```
New student "Jane Smith"
Checks:
- Mobile: ✅ Not found
- Roll: ✅ Unique
- Email: ✅ Unique
- Face: ✅ Distance > 0.6 from all students
Result: ✅ Registration successful
```

## Configuration

### Adjusting Face Similarity Threshold

**Node.js** (`server/index.js`):
```javascript
const FACE_SIMILARITY_THRESHOLD = 0.6; // Change this value

// Stricter (fewer false matches): 0.5
// Default (balanced): 0.6
// Looser (catch more duplicates): 0.7
```

**Python** (`python_backend/app.py`):
```python
FACE_SIMILARITY_THRESHOLD = 0.6  # Change this value
```

### Understanding the Threshold
- **Lower (0.4-0.5)**: Very strict - may allow twins
- **Medium (0.6-0.7)**: Balanced - recommended
- **Higher (0.8+)**: Loose - may reject legitimate users

## Security Best Practices

1. **Database Constraints**: SQL UNIQUE constraints on mobile, email, roll_no
2. **OTP Verification**: Ensures mobile ownership
3. **Face Matching**: Prevents identity fraud
4. **Comprehensive Logging**: All duplicate attempts logged

## Testing Duplicate Prevention

### Test 1: Duplicate Mobile
1. Register student with mobile 1234567890
2. Try registering again with same mobile
3. Expected: Error during OTP send

### Test 2: Duplicate Roll Number
1. Register student with roll CS001
2. Register different student with roll CS001
3. Expected: "Roll number already registered"

### Test 3: Duplicate Face
1. Register student A with their face
2. Register same person as student B with different details
3. Expected: "Face already registered" with similarity %

### Test 4: Different Person (Twins)
1. Register twin A
2. Register twin B
3. Expected: May be flagged if faces very similar
4. Action: Adjust threshold if needed

## Deployment Checklist

- [ ] Set FACE_SIMILARITY_THRESHOLD appropriately
- [ ] Enable rate limiting on registration endpoints
- [ ] Add captcha for bot prevention
- [ ] Set up monitoring for duplicate attempts
- [ ] Create admin panel to review flagged registrations
- [ ] Implement appeals process for false positives
