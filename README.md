# Wicara Fana

Wicara Fana is an anonymous chat application where users can chat with random people. All chats automatically disappear after 3 hours.

## Features

- Anonymous chatting with random users
- Automatic chat expiration after 3 hours
- Random identity generation
- Real-time messaging

## Technologies Used

- React with TypeScript
- Firebase for backend (authentication and database)
- Socket.io for real-time communication
- TailwindCSS for styling
- Date-fns for date manipulation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/wicara-fana.git
cd wicara-fana
```

2. Install dependencies
```
npm install
```

3. Set up Firebase

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Create a web app in your Firebase project
   - Copy the Firebase config object
   - Replace the placeholder config in `src/firebase.ts` with your actual Firebase config

4. Start the development server
```
npm start
```

## Backend Setup (Required)

This frontend application requires a backend server for Socket.io functionality. You'll need to set up a Node.js server with Socket.io to handle real-time communication.

A basic server implementation should:

1. Set up a Socket.io server
2. Handle user connections/disconnections
3. Implement room joining/leaving logic
4. Handle message broadcasting
5. Implement room expiration after 3 hours

## Deployment

1. Build the application for production
```
npm run build
```

2. Deploy to your preferred hosting service (Firebase Hosting, Vercel, Netlify, etc.)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
