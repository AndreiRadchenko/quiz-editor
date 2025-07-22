# Quiz Editor

<div align="center">
  
  <div style="display: flex; justify-content: center; margin-top: 20px;">
    <img src="assets/quiz-editor-1" alt="Quiz Editor Screenshot 1" width="400" style="margin-right: 10px;"/>
    <img src="assets/quiz-editor-2" alt="Quiz Editor Screenshot 2" width="400"/>
  </div>
</div>

A comprehensive React Native application for managing quiz competitions with
real-time player management, multi-role support, and interactive features.

> **Note:** This app is designed for the production team of quiz competitions.
> Different team members use specific roles:
>
> - **Editor Role:** Used by the game editor to manage player order and control
>   the game flow
> - **Operator Role:** Used by the director, sound operators, and camera
>   operators
> - **General Role:** Used by the production team and producers
>
> After a tier is finalized, all production tablets display players in order:
> incorrect answers first, then players who used passes, then correct answers,
> and finally inactive users. The editor can reorder players using drag-and-drop
> or "move to top" buttons. All reordering operations are reflected immediately
> on all production team tablets, facilitating conversations with selected
> players.

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Development Workflow](#-development-workflow)
- [Technologies](#-technologies)
- [Backend Integration](#-backend-integration)
- [API Reference](#-api-reference)
- [Key Components](#-key-components)
- [WebSocket Message Handling](#-websocket-message-handling)
- [Important Notes](#-important-notes)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 📱 Overview

Quiz Editor is a mobile application designed for quiz hosts and operators to
manage contestants, track game state, and control the flow of quiz competitions.
The app supports multiple user roles, real-time updates, and
internationalization.

### Key Features

- **Player Management**: View, sort, and reorder quiz participants with
  drag-and-drop functionality
- **Multi-role Support**: Different interfaces for editors, operators, and
  general viewers
- **Quiz State Tracking**: Monitor prize pool, player counts, answers, timer
  status, and more
- **Real-time Updates**: WebSocket integration for instant data synchronization
- **Fullscreen Image Previews**: View player images in modal overlays
- **Internationalization**: Support for English and Ukrainian languages
- **Dark Theme**: Optimized UI for low-light environments

[🔝 Back to Top](#quiz-editor)

## 🏗️ Architecture

The application uses a modern React Native architecture with:

- **Component-based UI**: Modular design with reusable components
- **Context API**: Global state management via AppContext and WebSocketContext
- **React Query**: Server state management and data fetching
- **Navigation**: Screen routing with React Navigation
- **Theming**: Consistent styling system with dark mode support

[🔝 Back to Top](#quiz-editor)

## 📂 Project Structure

```
quiz-editor/
├── app/                      # Main application code
│   ├── assets/               # Images, fonts and static resources
│   ├── src/
│   │   ├── api/              # API communication functions
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── i18n/             # Internationalization
│   │   │   └── locales/      # Translation files
│   │   ├── navigation/       # Navigation configuration
│   │   ├── screens/          # Main application screens
│   │   ├── store/            # State management
│   │   ├── theme/            # UI theming
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   ├── App.tsx               # Application entry point
│   ├── app.json              # Expo configuration
│   └── babel.config.js       # Babel configuration
└── README.md                 # Project documentation
```

[🔝 Back to Top](#quiz-editor)

## 🚀 Installation and Setup

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/quiz-editor.git
   cd quiz-editor/app
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create appropriate configuration for your server connections

[🔝 Back to Top](#quiz-editor)

## 💻 Development Workflow

### Running the App

Start the development server:

```bash
npm start
# or
yarn start
```

This will open Expo DevTools in your browser. You can run the app on:

- Android emulator: Press `a`
- iOS simulator (macOS only): Press `i`
- Web browser: Press `w`
- Physical device: Scan the QR code with the Expo Go app

### Building the App

#### Development Build

```bash
eas build -p android --local --profile preview
```

#### Production Build

```bash
eas build -p android --profile production
```

### Going to Bare Workflow

If you need to access native code:

```bash
npx expo prebuild
```

After ejecting to bare workflow, you can build the app using:

```bash
# For Android
cd android
./gradlew assembleRelease

# For iOS (macOS only)
cd ios
pod install
xcodebuild -workspace YourApp.xcworkspace -scheme YourApp -configuration Release
```

[🔝 Back to Top](#quiz-editor)

## 🔧 Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Screen navigation
- **React Query**: Server state management
- **WebSockets**: Real-time data communication
- **React Native Reanimated**: High-performance animations
- **React Native Reorderable List**: Drag-and-drop list functionality
- **i18next**: Internationalization
- **AsyncStorage**: Local data persistence
- **Lodash**: Utility functions
- **Expo StatusBar**: Status bar management
- **React Native Gesture Handler**: Touch handling

[🔝 Back to Top](#quiz-editor)

## 🌐 Backend Integration

The app connects to a backend server via:

1. **HTTP API**: For CRUD operations

   - Base URL: `http://{serverIP}:5000`
   - Player management
   - Quiz state retrieval

2. **WebSockets**: For real-time updates
   - Connection status management
   - Live player and quiz state updates

[🔝 Back to Top](#quiz-editor)

## 🔌 API Reference

The application utilizes both REST API and WebSocket communication channels for
different operations.

### REST API Endpoints

| Method | Endpoint                          | Description                                   | Role Access |
| ------ | --------------------------------- | --------------------------------------------- | ----------- |
| GET    | `/game/state`                     | Retrieve current quiz state                   | All         |
| GET    | `/seats`                          | Get all seats/players                         | All         |
| GET    | `/seats?playerType={type}`        | Get players filtered by type                  | All         |
| GET    | `/seats/{seatNumber}`             | Get specific player details                   | All         |
| GET    | `/tiers`                          | Get prize tier structure                      | All         |
| PATCH  | `/game/editor-index/{seatNumber}` | Update a player's position in the editor list | Editor      |

### Key API Functions

#### Player Management

```typescript
// Fetch all players with optional type filtering
fetchSeatsData(serverIP, playerType?: 'editor' | 'operator' | 'viewer')

// Fetch specific player data
fetchPlayerData(seatNumber, serverIP)

// Update player's position in editor view (Editor role only)
updateSeatEditorIndex(seatNumber, newEditorIndex, serverIP)
```

#### Game State Management

```typescript
// Retrieve current quiz state
fetchQuizState(serverIP);

// Get prize tier structure
fetchTiersData(serverIP);
```

### WebSocket Communication

WebSocket connection is established at `ws://{serverIP}:5000/ws` and handles:

#### Example: Editor Role Operations

When operating as an Editor, the app enables special functionalities:

1. **Reordering Players**: When a player is dragged to a new position, the app
   calls:

```typescript
updateSeatEditorIndex(player.seatNumber, newIndex, serverIP);
```

[🔝 Back to Top](#quiz-editor)

## 🛠️ Key Components

### Screens

- **DefaultScreen**: Main player list view with quiz header
- **AdminScreen**: Configuration screen for server settings, language, and role

### Components

- **PlayerItem/PlayerItemOperator**: Player card with details and actions
- **QuizHeader**: Displays quiz state information
- **ConnectionStatus**: Shows WebSocket connection status
- **ReorderableList**: Drag-and-drop list of players

### Player Status Color Indicators

The app uses a color-coding system to visually represent player status:

| Color                                              | Status           | Description                                                           |
| -------------------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| <span style="color:#666; opacity:0.65">▇▇▇▇</span> | Default          | Currently inactive player. Standard item appearance (reduced opacity) |
| <span style="color:#526077">▇▇▇▇</span>            | Active           | Currently active player (primary hover color)                         |
| <span style="color:#1c6d1f">▇▇▇▇</span>            | Correct Answer   | Player answered correctly (green)                                     |
| <span style="color:#8b0d0d">▇▇▇▇</span>            | Incorrect Answer | Player answered incorrectly (red)                                     |
| <span style="color:#510bf5">▇▇▇▇</span>            | Pass Used        | Player used their pass option (blue)                                  |
| <span style="color:#b89217">▇▇▇▇</span>            | Bought Out       | Player used their buyout option (gold)                                |

These color indicators help operators and editors quickly identify player status
during the quiz.

[🔝 Back to Top](#quiz-editor)

## 🔍 Important Notes

1. **Performance Considerations**:

   - The app handles lists with potentially 100+ items
   - For performance with long lists, virtualization is disabled with
     `initialNumToRender={players.length}` to prevent scroll position issues

2. **Modal Image Viewer**:

   - Full-screen image previews work differently between development and
     production builds
   - Status bar handling may require different approaches on Android and iOS

3. **Status Bar and System UI**:

   - The app uses fullscreen mode with `<StatusBar hidden={true} />`
   - Modal overlays use specific configuration for proper display

4. **Admin Access**:
   - To access the admin screen, tap 4 times on the "WebSocket" word at the
     bottom of the screen
   - When prompted, enter the password: `12345678`
   - The admin screen allows changing roles, server settings, and language
     preferences

[🔝 Back to Top](#quiz-editor)

## 📋 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Commit: `git commit -m 'Add my feature'`
5. Push: `git push origin feature/my-feature`
6. Create a Pull Request

[🔝 Back to Top](#quiz-editor)

## 📄 License

[Specify your license here]

[🔝 Back to Top](#quiz-editor)

## 🤝 Contact

[Your contact information]

[🔝 Back to Top](#quiz-editor)

---

## 📡 WebSocket Message Handling

The app responds to various WebSocket messages to update the UI in real-time
through the `useWebSocket` hook.

### Message Event Types

The app handles the following WebSocket message events:

1. **Game Flow Events**:

   - `QUESTION_PRE` - Pre-question state
   - `QUESTION_OPEN` - Question is open for answers
   - `QUESTION_CLOSED` - Question is closed for answers
   - `QUESTION_COMPLETE` - Question round is completed
   - `BUYOUT_OPEN` - Buyout option is available
   - `BUYOUT_COMPLETE` - Buyout process is completed
   - `IDLE` - Game is in idle state

2. **Player Management Events**:

   - `UPDATE_PLAYERS` - Player data has been updated
   - `UPDATE_INDEX` - Player index/order has changed
   - `PLAYERS_TYPE` - Change in player type display (editor/operator/viewer)

3. **Interaction Events**:
   - `ANSWER` - Player answer submission
   - `CHECK` - Answer verification
   - `TIMER` - Timer status update

### Message Handling Behavior

#### Game Flow Events

When receiving game state events (`QUESTION_PRE`, `QUESTION_OPEN`, etc.):

- Updates the quiz state with new payload data
- Triggers specific UI updates based on the event type
- For `QUESTION_COMPLETE` and `BUYOUT_COMPLETE`:
  - Sets player type display to 'editor'
  - Invalidates and refreshes player queries
  - Between QUESTION_PRE and QUESTION_COMPLETE, game operators can control which
    player list (active/passed/all) appears on editor tablets

#### Player Management Events

- **UPDATE_PLAYERS**:

  - Fetches updated quiz state from server (non-editor roles only)
  - Resets player queries to refresh the UI

- **UPDATE_INDEX**:

  - Invalidates player queries to refresh the list (non-editor roles only)

- **PLAYERS_TYPE**:
  - Updates the player type display filter
  - Triggers query refresh with the new player type

#### Interaction Events

- **TIMER**:

  - Updates the timer status in the quiz state
  - Refreshes the UI to show current timer value

- **ANSWER** and **CHECK**:
  - These events are typically ignored in the client as they are mainly for
    server processing

### Error Handling

The WebSocket handler includes robust error management:

- Connection timeout detection
- Automatic reconnection with exponential backoff
- Detailed error reporting and status updates

[🔝 Back to Top](#quiz-editor)
