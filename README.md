# CodeTogether

Code Together is a collaborative code execution platform supporting multiple programming languages (Python, C++, Node.js) with real-time features. Users can write, share, and execute code in rooms, view outputs, and collaborate instantly.

## Features
- **Multi-language support:** Run Python, C++, and Node.js code.
- **Real-time collaboration:** Join rooms, share code, and see updates instantly via Socket.IO.

- **Queue-based execution:** Code is queued and executed securely on the server.
- **Output management:** View execution results and error messages.
- **REST API:** Interact with rooms and code execution via HTTP endpoints.

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm
- Docker (required for Redis background jobs, optional for C++ code isolation)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd CodeCollaboration
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Docker for Redis (required for background job processing):
   ```bash
   docker-compose up
   ```
   
   > **Note:** Docker is also optionally used for isolating C++ code execution. If you want extra security for C++ runs, ensure the Docker container for C++ is configured and running.

### Running the Server
Start the server:
```bash
npm start
```
The server runs on `http://localhost:3000` by default.

### Using the System
1. Open `public/index.html` in your browser.
2. Create or join a room.
3. Write code in Python, C++, or Node.js.
4. Submit code for execution.
5. View output in real-time.

### API Endpoints
- **Room Management:**
  - `POST /room` - Create a room
  - `GET /room/:id` - Get room info
- **Code Execution:**
  - `POST /runCode` - Execute code
  - `GET /outputs/:id` - Get code output

### Real-Time Collaboration
- Socket.IO is used for real-time communication.
- Users in the same room see code and output updates instantly.

### Supported Languages
- **Python:** Code is executed using a Python interpreter.
- **C++:** Code is compiled and run. For extra isolation, Docker can be used to run C++ code securely in a container.
- **Node.js:** JavaScript code is executed using Node.js.

### Testing the Project
1. **Manual Testing:**
   - Use the web interface to join rooms, write code, and execute.
   - Check outputs and error handling for each language.
2. **API Testing:**
   - Use tools like Postman to test REST endpoints.
   - Example: Send code to `/runCode` and verify output.
3. **Real-Time Testing:**
   - Open multiple browser windows and join the same room.
   - Verify code and output sync in real-time.

### Folder Structure
- `controllers/` - Handles code execution, room logic, file generation
- `models/` - Database models
- `public/` - Frontend files (HTML, CSS, JS)
- `routes/` - Express routes
- `queues/` - Code queue management
- `RealTime/` - Socket.IO setup
- `workers.js/` - Background workers for code execution
- `DB/` - Database connection

### Troubleshooting
- Ensure Docker is running for Redis (background jobs) and, if desired, for C++ code isolation.
- Check `npm start` and `docker-compose up` logs for errors.
- Verify all dependencies are installed.

### Contributing
Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

### License
MIT
