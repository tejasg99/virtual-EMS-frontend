# Virtual Event Management System Frontend

## Overview
This is the frontend for the Virtual Event Management System, a platform for discovering, hosting, and participating in virtual events. It's built using React, Vite, and Tailwind CSS, interacting with a dedicated backend API and real-time communication services.

## Core Features
* **User Authentication:**
    * Login and Registration pages with form validation.
    * JWT-based session management with token persistence in `localStorage`.
    * Automatic access token refresh using refresh tokens (via HttpOnly cookies managed by backend).
    * Protected routes for authenticated users and role-based access control.
* **Event Discovery & Details:**
    * **Events Page:** Lists all available events with pagination and basic card display.
    * **Event Detail Page:** Shows comprehensive details for a selected event, including description, schedule, organizer, and speakers.
* **Event Interaction:**
    * Users can register/unregister for events directly from the event detail page.
    * Displays user's current registration status for an event.
* **Live Event Participation (`EventLivePage`):**
    * **Video Streaming:** Integrated Jitsi Meet for live video/audio conferencing.
    * **Real-time Chat:** Event-specific chat rooms allowing attendees and organizers to communicate.
    * **Real-time Q&A:** Section for attendees to submit questions, upvote, and for organizers/speakers to answer.
* **User Profile Management:**
    * **Profile Page:** Displays logged-in user's information (name, email, role).
    * **Inline Profile Editing:** Allows users to update their name and email directly on the profile page.
* **Event Creation & Management:**
    * **Create Event Page:** Form for authenticated users (promoted to 'organizer' on first event creation) to create new events.
    * **Edit Event Page:** Allows event organizers or admins to modify details of existing events.
* **Organizer Dashboard:**
    * Lists events created by the logged-in organizer.
    * Displays summary statistics (total events, upcoming, live, total registrations).
    * Includes pagination for the event list.
* **Admin Dashboard:**
    * **User Management Page:** For administrators to view all users, change user roles, and delete users.
    * Includes pagination for the user list.
* **Notifications:**
    * Toast notifications for actions like login/logout, registration, event creation/update, errors.
    * Automated toast reminders for registered users when an event is about to start.
* **Responsive Design:** Styled with Tailwind CSS for adaptability across various screen sizes, featuring a custom light theme.
* **Routing:** Uses React Router v6 with data APIs (`createBrowserRouter`) for client-side navigation.
* **Error Handling:** Displays a "Not Found" page for invalid routes.

## Technology Stack

* **Build Tool:** Vite
* **UI Library:** React
* **Language:** JavaScript
* **Routing:** React Router DOM v6
* **State Management:** Redux Toolkit (including RTK Query for API interactions)
* **Styling:** Tailwind CSS
* **API Client:** Axios (configured instance with interceptors for token refresh, used by RTK Query's `axiosBaseQuery`)
* **Real-time Client:** Socket.IO Client
* **Forms:** React Hook Form
* **Date/Time:** `date-fns`
* **Notifications:** `react-hot-toast`
* **Icons:** `react-icons`

## Project Structure
```
virtual-event-frontend/
├── public/            # Static assets (index.html, favicon, etc.)
├── src/
│   ├── api/           # RTK Query setup: baseApi, axiosBaseQuery, specific API slices (auth, event, user, registration)
│   ├── app/           # Redux store configuration (store.js)
│   ├── components/    # Reusable UI components, categorized by feature/type
│   │   ├── admin/     # UserListItem.jsx
│   │   ├── auth/      # LoginForm.jsx, RegisterForm.jsx
│   │   ├── common/    # General components (LoadingSpinner, ErrorDisplay, StatCard - if used globally)
│   │   ├── dashboard/ # OrganizerEventRow.jsx, StatCard.jsx
│   │   ├── events/    # EventCard.jsx, EventForm.jsx
│   │   ├── layout/    # Navbar.jsx, Footer.jsx, MainLayout.jsx
│   │   ├── liveEvent/ # JitsiMeet.jsx, ChatMessage.jsx, ChatInput.jsx, ChatWindow.jsx, QnaItem.jsx, QnaInput.jsx, QnaList.jsx
│   │   └── profile/   # EditProfileForm.jsx
│   ├── hooks/         # Custom React hooks (e.g., useRequireAuth.jsx)
│   ├── lib/           # Shared utility functions (e.g., utils.js for getInitials)
│   ├── pages/         # Page components, assembling features for specific routes
│   ├── services/      # External service integrations (e.g., socketService.js)
│   └── slices/        # Redux Toolkit slices for non-API state (authSlice.js, uiSlice.js - optional)
├── .env               # Frontend environment variables (VITE_API_BASE_URL, VITE_SOCKET_URL)
├── .gitignore
├── index.html         # Vite HTML entry point
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tejasg99/virtual-EMS-frontend.git
    cd virtual-event-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create `.env` file:**
    Create a new `.env` file in the project root.
    Add the following environment variables:
    ```dotenv
    # Base URL for your backend API
    VITE_API_BASE_URL=http://localhost:<PORT>/api/v1

    # Optional: WebSocket server URL (if different from API base or needs specific port)
    # VITE_SOCKET_URL=http://localhost:<PORT>
    ```
    Replace `http://localhost:<PORT>` with your actual backend server address if it's different.

4.  **Ensure Backend is Running:** This frontend requires the backend server to be running and accessible at the `VITE_API_BASE_URL`.

## Running the Development Server
```bash
npm run dev
```
## Building for Production
```bash
npm run build
```