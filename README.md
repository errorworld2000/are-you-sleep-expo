# Are You Sleeping? - Expo

"Are You Sleeping?" is a lightweight social app designed to enhance connections between close friends or couples. Users can easily set and view each other's "sleep status" (e.g., "awake" or "asleep") and can send fun "poke" reminders as a lighthearted way to say goodnight or remind someone to get some rest.

---

## 📦 Features

- **User Authentication**: Completed registration, login, and logout processes with persistent login.
- **Home Page**: Displays a list of friends and their online status with real-time updates.
- **Status Toggling**: Users can easily switch their own sleep status on the home page with a toggle.
- **Friendship Features**: Implemented the full flow for adding friends, and viewing and accepting friend requests.
- **Interactive Feature**: Can send a "poke" to a friend and receive non-blocking real-time notifications.
- **Display Avatars in Friend List**: The friend list now displays friends' avatars.
- **Display Moods in Friend List**: The friend list now displays friends' current moods.
- **Background Notifications**: Integrated `expo-notifications` to receive "poke" push notifications even when the app is in the background or closed.
- **Smart Status Confirmation**: When the app starts or returns to the foreground, it automatically sends a "confirm awake" signal to the backend to reset the "poke" response timer.

---

## 📲 Tech Stack

- **Framework**: React Native (using the [Expo](https://expo.dev) toolchain)
- **State Management**: React Context / Zustand (can be updated as the project evolves)
- **Navigation**: React Navigation
- **Push Notifications**: expo-notifications
- **Backend Communication**: RESTful API + WebSocket (see backend documentation)

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v16 or higher recommended)

### 2. Installation

```bash
cd are-you-sleep-expo
npm install
```

### 3. Environment Configuration

Copy the `.env.template` file and configure it:

```bash
cp .env.template .env
```
### 4. Start the App

```bash
npx expo start
```

### Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Tutorial](https://docs.expo.dev/tutorial/introduction/)