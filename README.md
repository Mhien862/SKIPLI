# Classroom Management Application

Full-stack classroom management system with React, Express, Firebase and Socket.io.

## Tech Stack

Frontend: React, Ant Design, Axios, Socket.io Client
Backend: Node.js, Express, Firebase Admin SDK, Socket.io, Twilio, Nodemailer

## Project Structure

```
SKIPLI/
├── backend/
│   ├── config/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd SKIPLI
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
PORT=3001

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

NODE_ENV=development
SMS_PROVIDER=dev

FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

### 4. Firebase Configuration

1. Go to Firebase Console (https://console.firebase.google.com)
2. Create new project
3. Enable Firestore Database
4. Go to Project Settings - Service Accounts
5. Generate new private key
6. Copy credentials to backend .env file

### 5. Twilio Configuration (Optional)

1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token
3. Get Twilio phone number
4. Update backend .env with credentials
5. Change SMS_PROVIDER=dev to SMS_PROVIDER=twilio

Note: In development mode (SMS_PROVIDER=dev), access codes are logged to console.

## Running the Application

### Start Backend

```bash
cd backend
npm start
```

Backend runs on http://localhost:3001

### Start Frontend

```bash
cd frontend
npm start
```

Frontend runs on http://localhost:3000

## Environment Variables

### Backend .env
- PORT: Server port (default: 3001)
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER: Twilio credentials
- EMAIL_USER, EMAIL_PASS: Gmail credentials for sending emails
- FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL: Firebase credentials
- NODE_ENV: development or production
- SMS_PROVIDER: dev, twilio, or sms.to
- FRONTEND_URL: Frontend URL for CORS

### Frontend .env
- REACT_APP_API_URL: Backend API URL
- REACT_APP_SOCKET_URL: Socket.io server URL

## API Endpoints

### Authentication
- POST /api/auth/createAccessCode
- POST /api/auth/validateAccessCode
- POST /api/auth/loginEmail
- POST /api/auth/validateEmailAccessCode

### Instructor
- POST /api/instructor/addStudent
- POST /api/instructor/assignLesson
- GET /api/instructor/students
- GET /api/instructor/student/:phone
- PUT /api/instructor/editStudent/:phone
- DELETE /api/instructor/student/:phone

### Student
- GET /api/student/myLessons?phone=xxx
- POST /api/student/markLessonDone
- PUT /api/student/editProfile

## Troubleshooting

### SMS not sending
Check console logs for access code when SMS_PROVIDER=dev

### Email not sending
Use Gmail App Password (not regular password) for EMAIL_PASS

### Socket.io connection failed
Verify REACT_APP_SOCKET_URL matches backend port

### Firebase errors
Ensure private key format is correct with \n for line breaks