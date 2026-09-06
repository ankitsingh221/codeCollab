# codeCollab

A full-stack **real-time collaborative code editor**. Create workspaces, invite teammates by email, co-edit files with live cursors, run code against 11+ languages, and preview HTML/CSS/JS — all in the browser.

## Features

- **Real-time Collaboration** — Yjs CRDT-powered co-editing with live cursors, typing indicators, and per-user colors via Socket.io
- **Monaco Editor** — VS Code's editor in the browser with syntax highlighting and IntelliSense
- **Code Execution** — Run code in 11+ languages (Python, JavaScript, TypeScript, C, C++, Java, Go, Rust, PHP, Ruby, Bash) via Judge0
- **Live Preview** — Instant HTML/CSS/JS preview in a sandboxed iframe
- **Workspaces** — Create, manage, and collaborate in shared workspaces with role-based access (owner/editor)
- **Invitations** — Invite teammates by email with real-time notifications and accept/decline flow
- **Command Palette** — Quick navigation with `Ctrl+K`
- **Authentication** — Secure JWT auth with access/refresh tokens and httpOnly cookies

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 8, Tailwind CSS 4, React Router 6 |
| Editor | Monaco Editor, Yjs, y-monaco |
| UI Components | Radix UI, shadcn/ui, Lucide React, Geist Font |
| Backend | Node.js, Express 5, Socket.io 4 |
| Database | MongoDB (Mongoose 9) |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Collaboration | Yjs CRDT, y-protocols, Socket.io |
| Code Execution | Judge0 API |

## Project Structure

```
collabCode/
├── backend/
│   └── src/
│       ├── config/          # Database connection
│       ├── controllers/     # Auth, user, workspace, file, invitation, member, execution
│       ├── middleware/       # JWT auth, workspace access checks
│       ├── models/          # User, WorkSpace, File, Member, Invitation
│       ├── routes/          # REST API routes
│       ├── socket/          # Socket.io handlers, Yjs doc management, presence
│       ├── utils/           # Token generation, language maps
│       └── server.js        # Express + Socket.io server entry
│
├── frontend/
│   └── src/
│       ├── api/             # Axios client, API modules (file, workspace, member, invitation, execution)
│       ├── components/      # Editor, preview, file tree, modals, online users, ui/
│       ├── context/         # AuthContext, ToastContext
│       ├── hooks/           # useYjsFile, useWorkspacePresence, useDebounce
│       ├── pages/           # Landing, Login, Signup, Dashboard, WorkSpace, Profile, etc.
│       ├── socket/          # Socket.io client singleton
│       └── utils/           # Language maps, preview builder, helpers
```

## Architecture

### System Overview

```
                  ┌─────────────────────────────────────────────────┐
                  │                    Browser                      │
                  │                                                 │
┌──────────┐      │  ┌──────────────┐    ┌──────────────────────┐   │
│  React    │      │  │   React UI  │    │   Monaco Editor      │   │
│  Router   │ ───► │  │  (pages,    │    │  + y-monaco binding  │   │
│          │      │  │  components) │    └──────────┬───────────┘   │
└──────────┘      │  └──────┬───────┘               │               │
                  │         │ REST (axios)          │ Yjs update    │
                  │         ▼                       ▼               │
                  │  ┌──────────────────────────────────────┐       │
                  │  │          Socket.io client            │       │
                  │  └──────────────────┬───────────────────┘       │
                  └─────────────────────┼─────────────────────────┘
                                        │ HTTP + WebSocket
                                        ▼
                  ┌─────────────────────────────────────────────────┐
                  │                    Express 5                     │
                  │  ┌────────────┐  ┌──────────────┐  ┌─────────┐  │
                  │  │  REST API  │  │  Socket.io   │  │  Judge0 │  │
                  │  │ /api/*     │  │  server      │  │  proxy  │  │
                  │  └─────┬──────┘  └──────┬───────┘  └────┬────┘  │
                  │        │                │                │      │
                  │        ▼                │                ▼      │
                  │  ┌──────────┐       ┌─────────────────────┐      │
                  │  │ MongoDB  │       │  Yjs file sessions  │     │
                  │  │ (Mongoose)│      │  + presence store   │     │
                  │  └──────────┘       └─────────────────────┘     │
                  └─────────────────────────────────────────────────┘
```

### Key Concepts

**1. Real-time Collaboration**

The collaboration engine is built on **Yjs CRDT** with Socket.io as the transport layer. The server maintains in-memory `Y.Doc` sessions per file (managed by `fileCollabManager.js`):

- When a client opens a file, it emits `file:join`; the server creates (or reuses) an in-memory `Y.Doc` seeded from the MongoDB-stored content
- The newcomer receives a full state snapshot (`file:sync`) plus awareness states of all present users
- Subsequent keystrokes are broadcast as binary Yjs updates — the server applies them to the shared doc and relays them to the file room; conflict resolution is handled locally by the CRDT
- Awareness (cursor positions, selection, typing indicators, user colors) is propagated through `y-protocols/awareness` and broadcast to the `file:<id>` room
- Content is **auto-persisted to MongoDB** with a 2-second debounce plus an immediate final save when the last client leaves; line endings are normalized to LF

**2. Presence & Online Users**

`presenceStore.js` tracks who is online per workspace. On `workspace:join` the user is added to the `workspace:<id>` room and a `workspace:presence` event is broadcast to every member. Clients auto re-join their workspace and file rooms on socket reconnect.

**3. Authentication Flow**

JWT-based auth with split access/refresh tokens:

- **Access token** — short-lived (15 min), sent via `Authorization: Bearer`, verified by `authMiddleware` on every REST request
- **Refresh token** — long-lived (7 days), stored in an httpOnly cookie (`sameSite: none` + `secure` in production), rotated via `/auth/refresh`
- The frontend axios client queues requests that fail with 401 and retries them after refreshing the token
- Socket handshakes are authenticated with the same token via `socketAuth.js`

**4. Code Execution**

The frontend `RunPanel` posts to `POST /workspaces/:id/execute`; the backend proxies the request to the **Judge0 CE API**, mapping Monaco language IDs to Judge0 language IDs (`judge0LanguageMap.js`). Judge0 returns stdout/stderr/exit code which is rendered back in the panel.

**5. Live Preview**

For HTML/CSS/JS files, `buildPreviewDoc.js` bundles the CSS and JavaScript content into a single generated HTML document which is injected into a sandboxed iframe. The preview re-bundles and refreshes whenever the relevant files change (via the Yjs doc updates).

### Data Flow — Editing a File

1. User types in Monaco → `y-monaco` binding updates the local `Y.Doc`
2. Yjs fires a doc update → the `useYjsFile` hook emits `file:update` over Socket.io
3. Server applies the update to the in-memory shared doc (`applyDocUpdate`) and relays it to other clients in `file:<id>` room
4. Other clients apply the update to their local `Y.Doc` → Monaco rendering updates via the binding
5. Server debounces and persists content to MongoDB (2s after last change)
6. Awareness events simultaneously update remote cursors, selection highlights, and typing indicators

### Frontend State & Data Access

- **Context API** manages auth (`AuthContext`) and toasts (`ToastContext`)
- The **axios client** (`api/axiosClient.js`) attaches the access token, handles refresh-on-401, and centralizes error handling
- Vite bundles are code-split into `react`, `monaco`, and `collab` (yjs/socket.io) chunks so the editor is loaded lazily

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Judge0 API access ([ce.judge0.com](https://ce.judge0.com) public instance or self-hosted)

### Installation

```bash
git clone https://github.com/ankitsingh221/codeCollab.git
cd codeCollab
```

**Backend:**

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codeCollab
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend:**

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running

Start both servers in separate terminals:

```bash
# Backend (runs on port 5000)
cd backend
npm run dev

# Frontend (runs on port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (hot reload) |
| `npm start` | Start server in production mode |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## API Reference

All routes are prefixed with `/api`.

### Authentication

| Method | Route | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout (clears cookie) |

### Users

| Method | Route | Description |
|---|---|---|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update profile |

### Workspaces

| Method | Route | Description |
|---|---|---|
| POST | `/workspaces` | Create workspace |
| GET | `/workspaces` | List user's workspaces |
| GET | `/workspaces/:id` | Get workspace details |
| PATCH | `/workspaces/:id` | Update workspace (owner only) |
| DELETE | `/workspaces/:id` | Delete workspace (owner only) |

### Members

| Method | Route | Description |
|---|---|---|
| GET | `/workspaces/:id/members` | List workspace members |
| PATCH | `/workspaces/:id/members/:memberId` | Update member role (owner only) |
| DELETE | `/workspaces/:id/members/:memberId` | Remove member (owner only) |
| DELETE | `/workspaces/:id/members/me` | Leave workspace |

### Invitations

| Method | Route | Description |
|---|---|---|
| POST | `/workspaces/:id/invitations` | Invite user by email (owner only) |
| GET | `/workspaces/:id/invitations` | List pending invitations (owner only) |
| DELETE | `/workspaces/:id/invitations/:invitationId` | Cancel invitation (owner only) |
| GET | `/invitations/me` | Get invitations for current user |
| POST | `/invitations/:id/accept` | Accept invitation |
| POST | `/invitations/:id/decline` | Decline invitation |

### Files

| Method | Route | Description |
|---|---|---|
| POST | `/workspaces/:id/files` | Create file |
| GET | `/workspaces/:id/files` | List files in workspace |
| GET | `/workspaces/:id/files/:fileId` | Get file content |
| PATCH | `/workspaces/:id/files/:fileId` | Update file (name, language, content) |
| DELETE | `/workspaces/:id/files/:fileId` | Delete file |

### Execution

| Method | Route | Description |
|---|---|---|
| POST | `/workspaces/:id/execute` | Execute code via Judge0 |

### Health

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Server health check |

## Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `workspace:join` | Client → Server | Join workspace room |
| `workspace:leave` | Client → Server | Leave workspace room |
| `file:join` | Client → Server | Join file collaboration session |
| `file:leave` | Client → Server | Leave file collaboration session |
| Yjs sync + awareness | Bidirectional | Real-time document sync and cursor presence |

**Rooms:** `workspace:<id>`, `file:<id>`, `user:<id>`, `email:<email>`

