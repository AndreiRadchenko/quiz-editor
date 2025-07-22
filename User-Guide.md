# Quiz Editor - User Guide for Production Team

<div align="center">
  
  <div style="display: flex; justify-content: center; margin-top: 20px;">
    <img src="assets/quiz-editor-1" alt="Quiz Editor Screenshot 1" width="400" style="margin-right: 10px;"/>
  </div>
</div>

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [Initial Setup](#initial-setup)
3. [User Roles](#user-roles)
   - [Editor Role](#editor-role)
   - [Operator Role](#operator-role)
   - [Producer Role (General)](#producer-role-general)
4. [Interface Overview](#interface-overview)
   - [Player List](#player-list)
   - [Color Coding System](#color-coding-system)
   - [Quiz Header](#quiz-header)
5. [Working with Different Roles](#working-with-different-roles)
   - [Editor Workflow](#editor-workflow)
   - [Operator Workflow](#operator-workflow)
   - [Producer Workflow](#producer-workflow)
6. [Common Tasks](#common-tasks)
   - [Viewing Player Details](#viewing-player-details)
   - [Managing Player Order](#managing-player-order)
   - [Handling Answers](#handling-answers)
   - [Accessing Admin Settings](#accessing-admin-settings)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

Quiz Editor is a comprehensive mobile application designed specifically for the
production team of quiz competitions. The app facilitates real-time player
management, quiz state tracking, and efficient communication between different
team members through designated roles.

## Getting Started

### Installation

The Quiz Editor app is pre-installed on production team tablets. If you need to
install it manually:

1. Obtain the APK file from your technical team
2. Install the APK on your Android device
3. Launch the Quiz Editor app

### Initial Setup

When you first open the app, you need to configure your role and server
connection:

1. Tap 4 times on the "WebSocket" word at the bottom of the screen
2. Enter the password: `12345678`
3. In the Admin screen, set:
   - Server IP: Enter the IP address provided by your technical team
   - Role: Select your assigned role (Editor, Operator, or General)
   - Language: Choose your preferred language (English or Ukrainian)
4. Tap "Save" to confirm your settings

## User Roles

### Editor Role

**Who should use this role:** Game editor, quiz master

**Main responsibilities:**

- Managing the flow of the game
- Reordering players after question rounds
- Prioritizing players for camera focus

**Special features:**

- Drag and drop functionality for player reordering
- Move to top/bottom options for quick prioritization
- Player order changes are immediately reflected on all other devices

### Operator Role

**Who should use this role:** Director, camera operators, sound operators

**Main responsibilities:**

- Monitoring active players
- Following the game state
- Directing camera focus according to editor's player order

**Special features:**

- Real-time updates of player order set by the editor
- Visual indicators for player status (correct/incorrect answers, passes)
- Optimized view for production operations

### Producer Role (General)

**Who should use this role:** Producers, production assistants

**Main responsibilities:**

- Overseeing the game progress
- Monitoring player performance
- Supporting communication between team members

**Special features:**

- Complete overview of all players
- Real-time updates without reordering capabilities
- Focus on monitoring rather than game control

## Interface Overview

### Player List

The player list displays all contestants with their relevant information:

- Player name
- Seat number
- Current rank
- Number of passes used
- Current answer (if applicable)
- Relations with other players

### Color Coding System

Players are color-coded for quick status identification:

| Status           | Color      | Description                                 |
| ---------------- | ---------- | ------------------------------------------- |
| Default          | Gray       | Currently inactive player (reduced opacity) |
| Active           | Light Gray | Currently active player                     |
| Correct Answer   | Green      | Player answered correctly                   |
| Incorrect Answer | Red        | Player answered incorrectly                 |
| Pass Used        | Blue       | Player used their pass option               |
| Bought Out       | Gold       | Player used their buyout option             |

### Quiz Header

The quiz header shows important game information:

- Current tier
- Prize pool
- Countdown timer (if active)
- Number of remaining players
- Game state

## Working with Different Roles

### Editor Workflow

1. **During active question rounds:**

   - Observe player information and statuses

2. **After a tier is finalized:**

   - Players are automatically sorted by answer status:
     1. Incorrect answers first
     2. Players who used passes
     3. Correct answers
     4. Inactive players
   - Reorder players using drag-and-drop or the move buttons
   - Prioritize players for camera focus and discussions

3. **Player reordering:**
   - Long-press on a player to enable drag mode
   - Drag the player to the desired position
   - Release to place them
   - Alternatively, use the arrow buttons on the right to move players to
     top/bottom
   - All changes are instantly synchronized to all devices

### Operator Workflow

1. **During active question rounds:**

   - Monitor player statuses using the color-coding system
   - Prepare for upcoming player focus changes

2. **After a tier is finalized:**

   - Observe the automatic sorting of players
   - Monitor the editor's reordering in real-time
   - Focus cameras on players according to the editor's prioritization
   - Use player details (seat number, image) to quickly identify contestants

3. **Viewing player details:**
   - Tap on a player's image to open the full-screen view
   - Note the seat number for quick identification on set

### Producer Workflow

1. **During active question rounds:**

   - Monitor overall game progress
   - Track player performance statistics

2. **After a tier is finalized:**

   - Review the results of the round
   - Observe player ordering for production planning
   - Support coordination between editor and operators

3. **Using player information:**
   - Monitor relations between players for story development
   - Track answer patterns across rounds

## Common Tasks

### Viewing Player Details

1. **View player image:**

   - Tap on the player's thumbnail to open a full-screen view
   - Tap anywhere on the screen to close the image

2. **Check player information:**
   - Player name and rank are displayed at the top
   - Additional information (occupation, notes, goal) if available
   - Current answer (during question rounds)
   - Relations with other players (if any)

### Managing Player Order (Editor Only)

1. **Drag and drop:**

   - Long-press on a player card until it becomes "lifted"
   - Drag to the desired position in the list
   - Release to place the player in the new position

2. **Quick movement:**

   - Use the up arrow button to move a player to the top of the list
   - Use the down arrow button to move a player to the bottom of the list

3. **When you can reorder:**
   - Reordering is enabled only after a question round is complete
   - During active question rounds, the reordering functionality is disabled

### Handling Answers

1. **After round completion:**
   - The system automatically sorts players based on their answer status
   - Editors can then manually adjust the order for production purposes

### Accessing Admin Settings

1. **Open admin screen:**

   - Tap 4 times on the "WebSocket" word at the bottom of the screen
   - Enter the password: `12345678`

2. **Configure settings:**

   - Change your role if needed
   - Update server connection
   - Switch language preferences

3. **Save changes:**
   - Tap the "Save" button to apply your changes
   - The app will reconnect with the new settings

## Troubleshooting

1. **Connection issues:**

   - Check that you're connected to the production network
   - Verify the server IP address in admin settings
   - Look for the connection status indicator at the bottom of the screen
   - The app will automatically try to reconnect if the connection is lost

2. **Player list not updating:**

   - Check your connection status
   - Try accessing the admin screen and saving settings again to force
     reconnection
   - Restart the app if problems persist

3. **Cannot access admin screen:**

   - Ensure you're tapping exactly on the "WebSocket" text at the bottom of the
     screen
   - Tap exactly 4 times in succession
   - Make sure you're entering the correct password: `12345678`

4. **App performance:**
   - Keep the app open during the entire production
   - Avoid switching between multiple apps on the same device
   - If the app becomes unresponsive, restart it and reconnect

---

© Quiz Editor Production Team
