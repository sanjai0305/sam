from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime, timedelta
import os
import random
import math

app = Flask(__name__)
CORS(app)

# Database setup
DB_PATH = 'database/students.db'

# In-memory OTP storage
otp_store = {}

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def calculate_distance(descriptor1, descriptor2):
    """Calculate euclidean distance between two face descriptors"""
    if not descriptor1 or not descriptor2:
        return float('inf')
    
    sum_sq = sum((a - b) ** 2 for a, b in zip(descriptor1, descriptor2))
    return math.sqrt(sum_sq)

def init_db():
    """Initialize SQLite database with tables"""
    os.makedirs('database', exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            mobile_number TEXT UNIQUE,
            dob TEXT,
            roll_no TEXT UNIQUE,
            email TEXT UNIQUE,
            course TEXT,
            photo TEXT,
            descriptor TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            date TEXT NOT NULL,
            status TEXT DEFAULT 'Present',
            confidence REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

@app.route('/api/otp/send', methods=['POST'])
def send_otp():
    """Send OTP to mobile number"""
    try:
        data = request.json
        mobile_number = data.get('mobileNumber')
        
        if not mobile_number or len(mobile_number) < 10:
            return jsonify({'error': 'Invalid mobile number'}), 400
        
        # Check if mobile already registered
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students WHERE mobile_number = ?', (mobile_number,))
        existing = cursor.fetchone()
        conn.close()
        
        if existing:
            return jsonify({
                'error': 'This mobile number is already registered',
                'duplicate': True,
                'field': 'mobile',
                'existingStudent': {
                    'name': f"{existing['first_name']} {existing['last_name']}",
                    'rollNo': existing['roll_no']
                }
            }), 400
        
        otp = generate_otp()
        otp_store[mobile_number] = {
            'otp': otp,
            'expires_at': datetime.now() + timedelta(minutes=5)
        }
        
        print(f"📱 OTP for {mobile_number}: {otp}")
        
        return jsonify({
            'message': 'OTP sent successfully',
            'demo_otp': otp
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/otp/verify', methods=['POST'])
def verify_otp():
    """Verify OTP"""
    try:
        data = request.json
        mobile_number = data.get('mobileNumber')
        otp = data.get('otp')
        
        if not mobile_number or not otp:
            return jsonify({'error': 'Mobile number and OTP are required'}), 400
        
        stored_data = otp_store.get(mobile_number)
        
        if not stored_data:
            return jsonify({'error': 'OTP not found or expired'}), 400
        
        if datetime.now() > stored_data['expires_at']:
            del otp_store[mobile_number]
            return jsonify({'error': 'OTP has expired'}), 400
        
        if stored_data['otp'] != otp:
            return jsonify({'error': 'Invalid OTP'}), 400
        
        del otp_store[mobile_number]
        
        return jsonify({
            'message': 'OTP verified successfully',
            'verified': True
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students')
        students = [dict(row) for row in cursor.fetchall()]
        
        for student in students:
            if student['descriptor']:
                student['descriptor'] = json.loads(student['descriptor'])
        
        conn.close()
        return jsonify(students), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students', methods=['POST'])
def create_student():
    """Register a new student with DUPLICATE PREVENTION"""
    try:
        data = request.json
        
        if not data.get('firstName') or not data.get('photo'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # DUPLICATE CHECK 1: Mobile Number
        if data.get('mobileNumber'):
            cursor.execute('SELECT * FROM students WHERE mobile_number = ?', (data.get('mobileNumber'),))
            existing = cursor.fetchone()
            if existing:
                conn.close()
                return jsonify({
                    'error': 'Mobile number already registered',
                    'duplicate': True,
                    'field': 'mobile',
                    'existingStudent': {
                        'name': f"{existing['first_name']} {existing['last_name']}",
                        'rollNo': existing['roll_no']
                    }
                }), 400
        
        # DUPLICATE CHECK 2: Roll Number
        if data.get('rollNo'):
            cursor.execute('SELECT * FROM students WHERE roll_no = ?', (data.get('rollNo'),))
            existing = cursor.fetchone()
            if existing:
                conn.close()
                return jsonify({
                    'error': 'Roll number already registered',
                    'duplicate': True,
                    'field': 'rollNo'
                }), 400
        
        # DUPLICATE CHECK 3: Email
        if data.get('email'):
            cursor.execute('SELECT * FROM students WHERE email = ?', (data.get('email'),))
            existing = cursor.fetchone()
            if existing:
                conn.close()
                return jsonify({
                    'error': 'Email already registered',
                    'duplicate': True,
                    'field': 'email'
                }), 400
        
        # DUPLICATE CHECK 4: Face Descriptor Similarity
        if data.get('descriptor'):
            cursor.execute('SELECT * FROM students')
            all_students = cursor.fetchall()
            FACE_SIMILARITY_THRESHOLD = 0.6
            
            new_descriptor = data.get('descriptor')
            
            for student in all_students:
                if student['descriptor']:
                    existing_descriptor = json.loads(student['descriptor'])
                    distance = calculate_distance(new_descriptor, existing_descriptor)
                    
                    if distance < FACE_SIMILARITY_THRESHOLD:
                        conn.close()
                        return jsonify({
                            'error': 'This face is already registered in the system',
                            'duplicate': True,
                            'field': 'face',
                            'existingStudent': {
                                'name': f"{student['first_name']} {student['last_name']}",
                                'rollNo': student['roll_no'],
                                'similarity': f"{round((1 - distance) * 100)}%"
                            }
                        }), 400
        
        # All checks passed, insert student
        descriptor_json = json.dumps(data.get('descriptor', []))
        
        cursor.execute('''
            INSERT INTO students (first_name, last_name, mobile_number, dob, roll_no, email, course, photo, descriptor)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('firstName'),
            data.get('lastName'),
            data.get('mobileNumber'),
            data.get('dob'),
            data.get('rollNo') or data.get('id'),
            data.get('email'),
            data.get('course'),
            data.get('photo'),
            descriptor_json
        ))
        
        student_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"✅ New student registered: {data.get('firstName')} {data.get('lastName')}")
        return jsonify({'id': student_id, 'message': 'Student registered successfully'}), 201
        
    except sqlite3.IntegrityError as e:
        return jsonify({'error': 'Duplicate entry detected', 'details': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM students WHERE id = ?', (student_id,))
        cursor.execute('DELETE FROM attendance WHERE student_id = ?', (student_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    """Get attendance records"""
    try:
        date_filter = request.args.get('date')
        
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if date_filter:
            cursor.execute('SELECT * FROM attendance WHERE date = ?', (date_filter,))
        else:
            today = datetime.now().strftime('%m/%d/%Y')
            cursor.execute('SELECT * FROM attendance WHERE date = ?', (today,))
        
        records = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify(records), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    """Mark student attendance"""
    try:
        data = request.json
        student_id = data.get('studentId')
        status = data.get('status', 'Present')
        confidence = data.get('confidence')
        
        date_str = datetime.now().strftime('%m/%d/%Y')
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM attendance WHERE student_id = ? AND date = ?', (student_id, date_str))
        existing = cursor.fetchone()
        
        if existing:
            conn.close()
            return jsonify({'message': 'Attendance already marked'}), 200
        
        cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
        student = cursor.fetchone()
        
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        cursor.execute('''
            INSERT INTO attendance (student_id, date, status, confidence)
            VALUES (?, ?, ?, ?)
        ''', (student_id, date_str, status, confidence))
        
        conn.commit()
        record_id = cursor.lastrowid
        conn.close()
        
        return jsonify({'id': record_id, 'message': 'Attendance marked successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'backend': 'Python/Flask'}), 200

if __name__ == '__main__':
    print("Python Backend running on http://localhost:5001")
    print("✅ OTP System: Demo mode (OTPs logged to console)")
    print("✅ Duplicate Prevention: Active (Mobile, Roll No, Email, Face)")
    app.run(host='0.0.0.0', port=5001, debug=True)
