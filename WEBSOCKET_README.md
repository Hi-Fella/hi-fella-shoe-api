# WebSocket Implementation - Hi-Fella Shoe API

This document describes the WebSocket implementation using Socket.IO in the Hi-Fella Shoe API project.

## Architecture

### File Structure

```
src/websocket/
├── app.gateway.ts      # WebSocket gateway with event handlers
├── websocket.module.ts # Module configuration
└── websocket.service.ts # Business logic and client management
```

### Components

#### 1. WebsocketModule (`websocket.module.ts`)

The main module that provides and exports:

- `AppGateway` - Handles WebSocket connections and events
- `WebsocketService` - Manages clients and messaging logic

#### 2. AppGateway (`app.gateway.ts`)

The WebSocket gateway that:

- Handles client connections/disconnections
- Listens for client messages
- Manages room operations
- Emits events to clients

**Configuration:**

- CORS enabled for all origins
- WebSocket and polling transports supported
- Runs on same port as HTTP server (defined by `PORT` environment variable, default: 3000)
- Integrated with NestJS application server

#### 3. WebsocketService (`websocket.service.ts`)

Service that provides:

- Client tracking and management
- Room management
- Messaging utilities
- Server instance management

## WebSocket Events

### Client-to-Server Events

#### `joinRoom`

Join a specific room for targeted messaging.

**Payload:**

```json
{
  "room": "room-name"
}
```

**Response to Client:**

```json
{
  "event": "joinedRoom",
  "data": {
    "room": "room-name",
    "clientId": "client-id",
    "timestamp": "2025-11-17T06:30:00.000Z"
  }
}
```

**Emitted to Room:**

```json
{
  "clientId": "client-id",
  "room": "room-name",
  "timestamp": "2025-11-17T06:30:00.000Z"
}
```

#### `leaveRoom`

Leave a specific room.

**Payload:**

```json
{
  "room": "room-name"
}
```

**Response to Client:**

```json
{
  "event": "leftRoom",
  "data": {
    "room": "room-name",
    "clientId": "client-id",
    "timestamp": "2025-11-17T06:30:00.000Z"
  }
}
```

**Emitted to Room:**

```json
{
  "clientId": "client-id",
  "room": "room-name",
  "timestamp": "2025-11-17T06:30:00.000Z"
}
```

#### `sendMessage`

Send a message to a specific room.

**Payload:**

```json
{
  "room": "room-name",
  "message": "Hello room!"
}
```

**Response to Client:**

```json
{
  "event": "messageSent",
  "data": {
    "clientId": "client-id",
    "room": "room-name",
    "message": "Hello room!",
    "timestamp": "2025-11-17T06:30:00.000Z"
  }
}
```

**Emitted to Room:**

```json
{
  "clientId": "client-id",
  "room": "room-name",
  "message": "Hello room!",
  "timestamp": "2025-11-17T06:30:00.000Z"
}
```

#### `ping`

Ping the server for connectivity check.

**Response to Client:**

```json
{
  "timestamp": "2025-11-17T06:30:00.000Z"
}
```

### Server-to-Client Events

#### `userJoined`

Sent to room members when a new user joins.

**Payload:**

```json
{
  "clientId": "client-id",
  "room": "room-name",
  "timestamp": "2025-11-17T06:30:00.000Z"
}
```

#### `userLeft`

Sent to room members when a user leaves.

**Payload:**

```json
{
  "clientId": "client-id",
  "room": "room-name",
  "timestamp": "2025-11-17T06:30:00.000Z"
}
```

#### `newMessage`

Sent to room members when a message is posted.

**Payload:**

```json
{
  "clientId": "client-id",
  "room": "room-name",
  "message": "Hello room!",
  "timestamp": "2025-11-17T06:30:00.000Z"
}
```

#### `pong`

Response to ping event.

**Payload:**

```json
{
  "timestamp": "2025-11-17T06:30:00.000Z"
}
```

## HTTP API Integration

The WebSocket service is integrated with HTTP endpoints in `app.controller.ts` to allow server-initiated messaging.

### Endpoints

#### `POST /broadcast`

Broadcast a message to all connected clients.

**Request Body:**

```json
{
  "message": "Broadcast message",
  "event": "notification" // optional, defaults to 'notification'
}
```

#### `POST /send-to-room/:room`

Send a message to all clients in a specific room.

**Request Body:**

```json
{
  "message": "Room message",
  "event": "roomMessage" // optional, defaults to 'roomMessage'
}
```

#### `POST /trigger-notification`

Send a structured notification.

**Request Body:**

```json
{
  "type": "success", // "info", "success", "warning", "error"
  "title": "Notification Title",
  "message": "Notification message",
  "targetRoom": "room-name", // optional
  "targetClientId": "client-id" // optional
}
```

#### `GET /websocket-stats`

Get WebSocket server statistics and client information.

**Response:**

```json
{
  "connectedClients": 3,
  "isServerInitialized": true,
  "clients": [
    {
      "id": "client-id",
      "rooms": ["room1", "room2"],
      "connectedAt": "2025-11-17T06:30:00.000Z"
    }
  ]
}
```

## Environment Configuration

Add the following to your `.env` file:

```env
# Server port (both HTTP and WebSocket)
PORT=8000
```

Note: The WebSocket server now runs on the same port as the HTTP server, integrated through NestJS.

## How to Test

### 1. Start the Server

```bash
# Install dependencies (if not installed)
yarn

# Start in development mode
yarn start:dev

# Or build and start in production mode
yarn build
yarn start:prod
```

The server will start:

- HTTP API and WebSocket server on port 8000 (or PORT env variable)

### 2. Connect with a WebSocket Client

Using any WebSocket client (like Postman, Apidog, or a simple JavaScript client):

```javascript
// Connect to WebSocket server
const socket = io('http://localhost:8000', {
  transports: ['websocket'],
});

// Listen for welcome message
socket.on('welcome', (data) => {
  console.log('Welcome:', data);
});

// Join a room
socket.emit('joinRoom', { room: 'test-room' });

// Listen for room events
socket.on('userJoined', (data) => {
  console.log('User joined:', data);
});

socket.on('newMessage', (data) => {
  console.log('New message:', data);
});

// Send a message to the room
socket.emit('sendMessage', {
  room: 'test-room',
  message: 'Hello from client!',
});
```

### 3. Test HTTP API Integration

Use any HTTP client (Postman, Apidog, curl) to test the server-to-client messaging:

```bash
# Broadcast to all clients
curl -X POST http://localhost:8000/broadcast \
  -H "Content-Type: application/json" \
  -d '{"message": "Server announcement!"}'

# Send to a specific room
curl -X POST http://localhost:8000/send-to-room/test-room \
  -H "Content-Type: application/json" \
  -d '{"message": "Room-specific message"}'

# Get WebSocket stats
curl http://localhost:8000/websocket-stats
```

### 4. Testing Flow

1. **Connect Multiple Clients**: Open multiple WebSocket connections to simulate different users
2. **Join Rooms**: Have clients join different rooms
3. **Send Messages**: Test client-to-client messaging within rooms
4. **HTTP Integration**: Use HTTP endpoints to send messages from server to clients
5. **Monitor Logs**: Watch server logs to see connection/disconnection events

## Error Handling

The implementation includes comprehensive error handling:

- Connection failures are logged
- Invalid client IDs return appropriate error responses
- Room operations validate room existence
- HTTP endpoints return structured error responses

## Security Considerations

- CORS is configured to allow all origins (configure as needed for production)
- Client authentication should be implemented for production use

## Logging

All WebSocket operations are logged using NestJS's Logger:

- Client connections/disconnections
- Room joins/leaves
- Message broadcasts
- Server initialization
