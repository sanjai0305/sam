# Implementing Real SMS OTP with Twilio

This guide shows how to upgrade from demo OTP to **real SMS** using Twilio.

## Prerequisites

1. Create a Twilio account at https://www.twilio.com/
2. Get your Account SID and Auth Token
3. Get a Twilio phone number

## For Node.js Backend

### 1. Install Twilio SDK

```bash
npm install twilio
```

### 2. Update `server/index.js`

Add at the top:
```javascript
const twilio = require('twilio');

// Twilio Configuration (use environment variables in production)
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const twilioPhone = 'YOUR_TWILIO_PHONE_NUMBER'; // e.g., +1234567890
const client = twilio(accountSid, authToken);
```

Replace the send OTP endpoint:
```javascript
app.post('/api/otp/send', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    
    if (!mobileNumber || mobileNumber.length < 10) {
      return res.status(400).json({ error: 'Invalid mobile number' });
    }

    const otp = generateOTP();
    
    otpStore.set(mobileNumber, {
      otp: otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Send real SMS via Twilio
    await client.messages.create({
      body: `Your OTP for Student Registration is: ${otp}. Valid for 5 minutes.`,
      from: twilioPhone,
      to: `+91${mobileNumber}` // Adjust country code as needed
    });

    console.log(`📱 OTP sent to ${mobileNumber}`);

    res.json({ message: 'OTP sent successfully' });
    // DO NOT return demo_otp in production

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});
```

## For Python Backend

### 1. Install Twilio SDK

```bash
pip install twilio
```

### 2. Update `python_backend/app.py`

Add at the top:
```python
from twilio.rest import Client

# Twilio Configuration
TWILIO_ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID'
TWILIO_AUTH_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN'
TWILIO_PHONE = 'YOUR_TWILIO_PHONE_NUMBER'
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
```

Replace the send OTP endpoint:
```python
@app.route('/api/otp/send', methods=['POST'])
def send_otp():
    try:
        data = request.json
        mobile_number = data.get('mobileNumber')
        
        if not mobile_number or len(mobile_number) < 10:
            return jsonify({'error': 'Invalid mobile number'}), 400
        
        otp = generate_otp()
        
        otp_store[mobile_number] = {
            'otp': otp,
            'expires_at': datetime.now() + timedelta(minutes=5)
        }
        
        # Send real SMS via Twilio
        message = twilio_client.messages.create(
            body=f'Your OTP for Student Registration is: {otp}. Valid for 5 minutes.',
            from_=TWILIO_PHONE,
            to=f'+91{mobile_number}'  # Adjust country code
        )
        
        print(f"📱 OTP sent to {mobile_number}")
        
        return jsonify({'message': 'OTP sent successfully'}), 200
        # DO NOT return demo_otp in production
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## Security Best Practices

1. **Environment Variables**: Store credentials in `.env` file
   ```bash
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE=your_phone
   ```

2. **Rate Limiting**: Limit OTP requests per number
   ```javascript
   // Add rate limiting
   const rateLimit = new Map();
   
   app.post('/api/otp/send', async (req, res) => {
     const { mobileNumber } = req.body;
     
     // Check rate limit
     const lastSent = rateLimit.get(mobileNumber);
     if (lastSent && Date.now() - lastSent < 60000) {
       return res.status(429).json({ error: 'Please wait 1 minute before requesting again' });
     }
     
     // ... rest of the code
     
     rateLimit.set(mobileNumber, Date.now());
   });
   ```

3. **OTP Attempts**: Limit verification attempts
   ```javascript
   otpStore.set(mobileNumber, {
     otp: otp,
     expiresAt: Date.now() + 5 * 60 * 1000,
     attempts: 0,
     maxAttempts: 3
   });
   ```

4. **HTTPS Only**: Use HTTPS in production
5. **Logging**: Log OTP activities for audit trail
6. **Database Storage**: Move OTP store to Redis for production

## Alternative SMS Providers

- **AWS SNS**: https://aws.amazon.com/sns/
- **Firebase Auth**: https://firebase.google.com/docs/auth/web/phone-auth
- **MSG91**: https://msg91.com/ (India-focused)
- **Plivo**: https://www.plivo.com/

## Testing Without SMS Credits

The current demo mode is perfect for development:
- OTP displayed in console
- OTP returned in API response (remove in production)
- No SMS costs during development
