# Student Management System with Face Recognition

A modern web application for managing students and tracking attendance using **real-time face recognition**.

## 🚀 Features

- ✅ **Face Recognition** - Real face matching using face-api.js
- ✅ **Student Registration** - Register students with face capture
- ✅ **Attendance Tracking** - Mark attendance via face scan
- ✅ **Student Directory** - View, search, and manage students
- ✅ **Reports** - Generate attendance reports with CSV export
- ✅ **Dual Backend** - Choose Node.js (Express) OR Python (Flask)

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python 3.8+** (optional, for Python backend)
- **Modern Browser** with webcam access

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# For Python backend (optional)
cd python_backend
pip install -r requirements.txt
cd ..
```

### 2. Download Face Recognition Models

The models should already be in `public/models/`. If not:

```bash
node scripts/download-models.js
```

## 🎯 Running the Application

### Option 1: Node.js Backend (Recommended)

**Terminal 1: Start Backend**
```bash
node server/index.js
```
✅ Backend runs on `http://localhost:5000`

**Terminal 2: Start Frontend**
```bash
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

### Option 2: Python Backend

**Terminal 1: Start Python Backend**
```bash
cd python_backend
python app.py
```
✅ Backend runs on `http://localhost:5001`

> ⚠️ If using Python backend, update API URLs in frontend code from port 5000 to 5001

**Terminal 2: Start Frontend**
```bash
npm run dev
```

## 🔧 Troubleshooting

### Error: "Failed to load face recognition models"

**Solution 1: Hard Refresh**
- Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- This clears the browser cache

**Solution 2: Check Models**
```bash
# Verify models exist
dir public\models
# Should show 8 files
```

**Solution 3: Restart Dev Server**
```bash
# Stop the dev server (Ctrl+C)
# Clear Vite cache
rmdir /s /q node_modules\.vite
# Restart
npm run dev
```

**Solution 4: Use Incognito/Private Mode**
- Sometimes browser extensions can interfere
- Try opening in incognito/private browsing mode

### Error: Backend connection failed

- Ensure backend is running (check terminal)
- Verify port 5000 (Node.js) or 5001 (Python) is not in use
- Check firewall settings

### Webcam not working

- Grant camera permissions when prompted
- Check if another app is using the camera
- Try a different browser (Chrome/Edge recommended)

## 📱 Usage Guide

### 1. Register a Student
1. Go to **Student Registration**
2. Fill in details (Name, Mobile, DOB, Roll No, etc.)
3. Click to **enable camera**
4. **Capture photo** (ensure good lighting and face visible)
5. Click **Register Student**

### 2. Take Attendance
1. Go to **Take Attendance**
2. Click **Start Face Scan**
3. Face the camera (same person who registered)
4. System will automatically match and mark attendance

### 3. View Reports
1. Go to **Attendance Reports**
2. Select date
3. View statistics and attendance list
4. Click **Export CSV** to download

### 4. Manage Students
1. Go to **Student Directory**
2. Search by name or roll number
3. Delete students if needed

## 🏗️ Project Structure

```
SAm/
├── public/
│   └── models/              # Face recognition AI models (8 files)
├── server/                  # Node.js backend
│   ├── index.js
│   └── data/                # NeDB database files
├── python_backend/          # Python Flask backend
│   ├── app.py
│   ├── requirements.txt
│   └── database/            # SQLite database
├── src/
│   ├── pages/              # React pages
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── StudentRegister.jsx
│   │   ├── Attendance.jsx
│   │   ├── AttendanceList.jsx
│   │   ├── StudentDirectory.jsx
│   │   └── AttendanceReport.jsx
│   ├── components/         # Reusable components
│   │   ├── Button.jsx
│   │   └── Input.jsx
│   └── utils/
│       ├── faceApi.js      # Face recognition utilities
│       └── studentStorage.js
└── scripts/
    └── download-models.js
```

## 🔐 Security Notes

- This is a **demo application** for development/learning
- Face recognition runs **entirely in the browser** (client-side)
- For production use:
  - Add proper authentication
  - Move face matching to server-side
  - Use encrypted database
  - Implement proper user access controls

## 🤝 Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Face Recognition**: face-api.js (TensorFlow.js based)
- **Backend**: Express.js (Node) / Flask (Python)
- **Database**: NeDB (Node) / SQLite (Python)
- **Icons**: Lucide React

## 📝 License

This project is for educational purposes.

---

**Need Help?** Check the troubleshooting section above or ensure all dependencies are installed correctly.
