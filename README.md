# Classroom Management Application

A full-stack classroom management system built with React, Express, Firebase, and Socket.io featuring real-time chat, SMS/Email authentication, and role-based dashboards.

## 🚀 Features

### Authentication
- **SMS Authentication**: Login using phone number with 6-digit verification code via Twilio
- **Email Authentication**: Alternative login method using email with access code
- **Role-based Access**: Separate dashboards for Instructors and Students

### Instructor Dashboard
- **Student Management**: Add, edit, and delete students
- **Lesson Assignment**: Assign lessons to students with title and description
- **Real-time Chat**: One-on-one messaging with students
- **Student Overview**: View all students and their lesson progress

### Student Dashboard
- **View Lessons**: See all assigned lessons
- **Mark Complete**: Mark lessons as done
- **Profile Management**: Edit personal information (name, email)
- **Real-time Chat**: Direct messaging with instructor

### Real-time Features
- **Socket.io Integration**: Instant message delivery
- **Message History**: Persistent chat storage in Firebase
- **Live Updates**: Real-time notifications across all connected users

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- npm or yarn
- Firebase account ([firebase.google.com](https://firebase.google.com))
- Twilio account ([twilio.com](https://www.twilio.com)) OR SMS.to account (optional, for production SMS)

## 🛠️ Tech Stack

### Frontend
- React 18
- Ant Design (UI Library)
- Axios (HTTP Client)
- Socket.io Client (Real-time Communication)
- React Router (Navigation)

### Backend
- Node.js
- Express.js
- Firebase Admin SDK (Database)
- Socket.io (WebSocket)
- Twilio (SMS Service)
- Nodemailer (Email Service)

## 📁 Project Structure

```
SKIPLI/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── instructor.js        # Instructor routes
│   │   └── student.js           # Student routes
│   ├── utils/
│   │   ├── sms.js               # SMS utility (Twilio/SMS.to)
│   │   └── email.js             # Email utility (Nodemailer)
│   ├── server.js                # Express server & Socket.io
│   ├── package.json
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatComponent.js
│   │   │   ├── LessonAssignment.js
│   │   │   └── StudentManagement.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── VerifyCode.js
│   │   │   ├── InstructorDashboard.js
│   │   │   └── StudentDashboard.js
│   │   ├── config/
│   │   │   └── api.js           # API configuration
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env                     # Environment variables
│
└── README.md
```

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SKIPLI
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

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

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Generate a new private key
6. Copy the credentials to your backend `.env` file

### 5. Twilio Setup (Optional - for Production SMS)

1. Sign up at [Twilio](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Get a Twilio phone number
4. Update `.env` with your Twilio credentials
5. Change `SMS_PROVIDER=dev` to `SMS_PROVIDER=twilio`

**Note**: In development mode (`SMS_PROVIDER=dev`), SMS codes are logged to console instead of being sent.

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:3001`

### Start Frontend Application

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## 📱 Usage

### For Instructors

1. **Login**: 
   - Enter your phone number or email
   - Receive 6-digit access code (via SMS or email)
   - Enter code to login
   - First-time users are automatically set as instructors

2. **Manage Students**:
   - Add new students with name, phone, and email
   - Students receive email with setup instructions
   - Edit or delete student records

3. **Assign Lessons**:
   - Select a student
   - Enter lesson title and description
   - Lesson is instantly available to student

4. **Chat with Students**:
   - Select a student from dropdown
   - Send and receive real-time messages
   - View message history

### For Students

1. **Login**:
   - Use email login method
   - Enter 6-digit code received via email
   - Access student dashboard

2. **View Lessons**:
   - See all assigned lessons
   - Mark lessons as complete
   - Track progress

3. **Edit Profile**:
   - Update name and email
   - Phone number cannot be changed

4. **Chat with Instructor**:
   - Send and receive messages in real-time
   - View conversation history

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/createAccessCode` - Send SMS access code
- `POST /api/auth/validateAccessCode` - Verify SMS code
- `POST /api/auth/loginEmail` - Send email access code
- `POST /api/auth/validateEmailAccessCode` - Verify email code

### Instructor Routes
- `POST /api/instructor/addStudent` - Add new student
- `POST /api/instructor/assignLesson` - Assign lesson to student
- `GET /api/instructor/students` - Get all students
- `GET /api/instructor/student/:phone` - Get student details
- `PUT /api/instructor/editStudent/:phone` - Update student
- `DELETE /api/instructor/student/:phone` - Delete student

### Student Routes
- `GET /api/student/myLessons?phone=xxx` - Get student's lessons
- `POST /api/student/markLessonDone` - Mark lesson as complete
- `PUT /api/student/editProfile` - Update student profile

## 🌐 Socket.io Events

### Client to Server
- `join` - Join chat room with userId and role
- `sendMessage` - Send a message
- `getMessages` - Retrieve message history

### Server to Client
- `newMessage` - Receive new message in real-time

## 📸 Screenshots

### Login Page
![Login Page - Phone and Email authentication tabs with modern gradient background]

### Instructor Dashboard - Student Management
![Student Management - Table view with add, edit, delete actions]

### Instructor Dashboard - Lesson Assignment
![Lesson Assignment - Form to assign lessons to students]

### Instructor Dashboard - Chat
![Real-time Chat - Messaging interface with student selection]

### Student Dashboard - Lessons
![Student Lessons - List view with mark as done functionality]

### Student Dashboard - Chat
![Student Chat - Direct messaging with instructor]

### Student Profile Edit
![Profile Modal - Edit student information]

## 🔒 Security Features

- Access codes expire and are deleted after successful validation
- Role-based access control for dashboards
- Phone numbers stored in localStorage for session management
- Firebase security rules should be configured for production
- HTTPS should be used in production

## 🐛 Troubleshooting

### SMS not sending in development
- This is expected. Check console logs for the access code when `SMS_PROVIDER=dev`

### Email not sending
- Ensure Gmail account has "App Password" enabled (not regular password)
- Check EMAIL_USER and EMAIL_PASS in .env

### Socket.io connection issues
- Verify REACT_APP_SOCKET_URL matches backend port
- Check for CORS issues

### Firebase errors
- Ensure private key is properly formatted with `\n` for line breaks
- Verify Firestore is enabled in Firebase Console

## 📝 Development Notes

- Code is written to be simple and clean without extensive comments
- All required features from the specification are implemented
- Ant Design is used for consistent UI components
- Axios is used for all HTTP requests
- Real-time features powered by Socket.io

## 🚢 Deployment

### Backend Deployment
1. Set NODE_ENV=production
2. Update SMS_PROVIDER to 'twilio' or 'sms.to'
3. Configure proper Firebase credentials
4. Deploy to Heroku, Railway, or similar

### Frontend Deployment
1. Update .env with production API URLs
2. Run `npm run build`
3. Deploy build folder to Netlify, Vercel, or similar

## 📧 Contact

For questions or issues, contact: engineering@skiplinow.com

## 📄 License

This project is part of a coding challenge for Skip Li.

---

**Note**: This application was built as part of Coding Challenge #6 for Skip Li, demonstrating full-stack development skills with React, Express, Firebase, and real-time communication.
