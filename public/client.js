/* ============================================
   Socket.IO Client Setup & Connection Management
   ============================================ */

// Initialize socket connection
const socket = io();

// DOM Elements
const joinForm = document.getElementById('joinForm');
const joinModal = document.getElementById('joinModal');
const editorView = document.getElementById('editorView');
const codeEditor = document.getElementById('codeEditor');
const membersList = document.getElementById('membersList');
const leaveBtn = document.getElementById('leaveBtn');
const usernameInput = document.getElementById('username');
const roomIDInput = document.getElementById('roomID');
const roomDisplay = document.getElementById('roomDisplay');
const currentUserDisplay = document.getElementById('currentUser');
const notificationContainer = document.getElementById('notificationContainer');
const connectionStatus = document.getElementById('connectionStatus');
const createRoomBtn = document.getElementById('createRoomBtn');
const resetRoomBtn = document.getElementById('resetRoomBtn');
const languageSelect = document.getElementById('languageSelect');
const typingIndicator = document.getElementById('typingIndicator');
const typingText = document.getElementById('typingText');
const roomErrorBox = document.getElementById('roomErrorBox');
// Compiler elements
const runCodeBtn = document.getElementById('runCodeBtn');
const outputPanel = document.getElementById('outputPanel');
const outputContent = document.getElementById('outputContent');
const clearOutputBtn = document.getElementById('clearOutputBtn');

// State Management
let currentRoom = null;
let currentUsername = null;
let currentSocketID = null;
let isUpdatingCode = false;
let currentLanguage = 'nodejs';
let typingTimeout = null;
let isCodeRunning = false;  // Track if code is currently executing

/* ============================================
   Code Compiler Helper Functions
   ============================================ */

/**
 * Display output in the output panel
 * @param {string} text - The output text to display
 * @param {string} type - 'success' or 'error'
 */
function displayOutput(text, type = 'normal') {
    // Clear placeholder when first output appears
    if (outputContent.querySelector('.output-placeholder')) {
        outputContent.innerHTML = '';
    }

    // Create output element with appropriate styling
    const outputLine = document.createElement('div');
    outputLine.className = type === 'error' ? 'output-error' : (type === 'success' ? 'output-success' : '');
    outputLine.textContent = text;

    outputContent.appendChild(outputLine);

    // Auto-scroll to bottom
    outputContent.scrollTop = outputContent.scrollHeight;
}

/**
 * Clear output panel
 */
function clearOutput() {
    outputContent.innerHTML = '<p class="output-placeholder">Output will appear here...</p>';
}

/**
 * Enable/disable Run Code button based on execution state
 */
function setRunButtonState(running) {
    isCodeRunning = running;

    if (running) {
        runCodeBtn.disabled = true;
        runCodeBtn.classList.add('loading');
        runCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
    } else {
        runCodeBtn.disabled = false;
        runCodeBtn.classList.remove('loading');
        runCodeBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
    }
}

/**
 * Send code to backend for execution
 */
async function runCode() {
    // Prevent multiple simultaneous executions
    if (isCodeRunning) {
        showNotification('Warning', 'Code is already running', 'warning');
        return;
    }

    // Get current code from editor
    const code = codeEditor.value;

    if (!code.trim()) {
        showNotification('Warning', 'Please write some code first', 'warning');
        return;
    }

    if (!currentRoom) {
        showNotification('Error', 'You must be in a room to run code', 'error');
        return;
    }

    // Step 1: Show loading state
    clearOutput();
    displayOutput('Running your code...', 'normal');
    setRunButtonState(true);

    try {
        // Step 2: Send POST request to backend with code, language, and roomId
        const response = await fetch('/api/v1/runCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                language: currentLanguage,
                roomId: currentRoom,
                username: currentUsername,
            }),
        });

        // Step 3: Check response status
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Step 4: Parse the response
        const data = await response.json();

        // Step 5: Display the output
        clearOutput();

        // Check if output is in the response (direct execution)
        if (data.output) {
            // Display successful output
            displayOutput(data.output, 'success');
            showNotification('Success', 'Code executed successfully', 'success');
            setRunButtonState(false);
            return;
        }

        // Check if code is queued (will come via Socket.io)
        if (data.status === 'queued') {
            displayOutput('Code queued... waiting for execution...', 'normal');
            // Don't set button state yet - wait for Socket.io event
            return;
        }

        if (data.error) {
            // Display error output
            displayOutput(data.error, 'error');
            showNotification('Execution Error', 'Code execution failed', 'error');
            setRunButtonState(false);
            return;
        }

        // Handle unexpected response format
        displayOutput(JSON.stringify(data), 'normal');
        setRunButtonState(false);
        displayOutput(`Error: ${error.message}`, 'error');
        showNotification('Error', 'Failed to run code: ' + error.message, 'error');
    } finally {
        // Step 7: Re-enable the Run button
        setRunButtonState(false);
    }
}

/* ============================================
   Run Code Button Event Listener
   ============================================ */

if (runCodeBtn) {
    runCodeBtn.addEventListener('click', runCode);
}

/* ============================================
   Clear Output Button Event Listener
   ============================================ */

if (clearOutputBtn) {
    clearOutputBtn.addEventListener('click', clearOutput);
}

/* ============================================
   Listen for code-output Socket.io event
   ============================================ */

/**
 * Real-time output from Socket.io for collaborative code execution
 * When any user in the room runs code, all users see the output
 */
socket.on('code-output', ({ output, error, username, language }) => {
    // Display who ran the code
    const message = `${username} ran code (${language}):`;
    console.log(message);

    // Clear previous output and show new output
    clearOutput();

    if (output) {
        displayOutput(output, 'success');
        showNotification('Code Output', `${username} ran ${language} code`, 'info');
    } else if (error) {
        displayOutput(error, 'error');
        showNotification('Execution Error', `${username}'s code failed`, 'error');
    }
});

/* ============================================
   UI Helper Functions (Defined First)
   ============================================ */

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Generate consistent color from username
function generateColorFromString(str) {
    const colors = [
        '#3b82f6', // blue
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#f59e0b', // amber
        '#10b981', // emerald
        '#06b6d4', // cyan
        '#6366f1', // indigo
        '#f43f5e', // rose
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

// Show notification toast
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Select icon based on type
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';

    notification.innerHTML = `
        <i class="notification-icon ${icon}"></i>
        <div class="notification-content">
            <div class="notification-title">${escapeHtml(title)}</div>
            <div class="notification-message">${escapeHtml(message)}</div>
        </div>
    `;

    notificationContainer.appendChild(notification);

    // Auto-remove notification after 4 seconds
    setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Update members list display
function updateMembersList(clients) {
    membersList.innerHTML = '';

    // Update member count - get fresh reference to ensure element exists
    const memberCountBadge = document.getElementById('memberCount');
    const memberCount = clients ? clients.length : 0;

    console.log('Updating members list. Count:', memberCount, 'Clients:', clients);

    if (memberCountBadge) {
        memberCountBadge.textContent = memberCount;
        console.log('Member count badge updated to:', memberCount);
    } else {
        console.warn('Member count badge element not found');
    }

    if (!clients || clients.length === 0) {
        membersList.innerHTML = '<p class="empty-state">No members yet</p>';
        return;
    }

    clients.forEach((client) => {
        const memberItem = document.createElement('div');
        memberItem.className = `member-item ${client.socketID === currentSocketID ? 'member-you' : ''}`;

        // Generate avatar with first letter
        const initial = client.username.charAt(0).toUpperCase();
        const avatarColor = generateColorFromString(client.username);

        memberItem.innerHTML = `
            <div class="member-avatar" style="background: ${avatarColor}">
                ${initial}
            </div>
            <div class="member-info">
                <div class="member-name">${escapeHtml(client.username)}</div>
                <div class="member-id">${client.socketID.substring(0, 8)}...</div>
            </div>
            ${client.socketID === currentSocketID ? '<span class="member-badge">You</span>' : ''}
        `;

        membersList.appendChild(memberItem);
    });
}

// Update connection status display
function updateConnectionStatus(isConnected) {
    connectionStatus.textContent = isConnected ? 'Connected' : 'Disconnected';
    connectionStatus.className = isConnected
        ? 'status-badge status-connected'
        : 'status-badge status-disconnected';
}

/* ============================================
   Join Room Functionality
   ============================================ */

joinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const roomID = roomIDInput.value.trim();

    if (!username || !roomID) {
        showNotification('Error', 'Please enter both username and room ID', 'error');
        return;
    }

    // Hide error box when user joins
    if (roomErrorBox) {
        roomErrorBox.classList.add('hidden');
    }

    // Store current session info
    currentUsername = username;
    currentRoom = roomID;

    console.log('Attempting to join room:', roomID, 'as:', username);

    // Emit join-room event to server
    socket.emit('join-room', { roomID, username });

    // Clear form
    joinForm.reset();
});

/* ============================================
   Create Room Functionality
   ============================================ */

console.log('createRoomBtn element:', createRoomBtn);

if (createRoomBtn) {
    createRoomBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const roomID = roomIDInput.value.trim();
        const username = usernameInput.value.trim();

        if (!roomID) {
            showNotification('Error', 'Please enter a Room ID to create', 'error');
            return;
        }

        if (!username) {
            showNotification('Error', 'Please enter your username', 'error');
            return;
        }

        try {
            createRoomBtn.disabled = true;
            createRoomBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

            console.log('Creating room with ID:', roomID, 'as:', username);
            const response = await fetch('/api/v1/createRoom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomId: roomID, username: username }),
            });

            const data = await response.json();
            console.log('Create room response status:', response.status, 'ok:', response.ok);
            console.log('Response data:', data);

            if (response.status === 201 || response.ok) {
                // Room created successfully (201 CREATED) - automatically join the room
                console.log('✅ Room created, auto-joining...');
                showNotification('Success', `✅ Room "${roomID}" created successfully!`, 'success');

                // Hide error box on success
                if (roomErrorBox) {
                    roomErrorBox.classList.add('hidden');
                }

                // Store current session info
                currentUsername = username;
                currentRoom = roomID;

                // Automatically emit join-room event to enter the room
                console.log('Auto-joining room:', roomID, 'as:', username);
                socket.emit('join-room', { roomID, username });

            } else if (response.status === 400) {
                // 400 error - room already exists
                console.error('❌ 400 Error - Room already exists:', data);

                // Show persistent error box on the page
                if (roomErrorBox) {
                    document.getElementById('errorTitle').textContent = 'Room Already Exists!';
                    document.getElementById('errorMessage').textContent = `"${roomID}" already exists. Click "Join Room" button to enter it.`;
                    roomErrorBox.classList.remove('hidden');
                }

                // Keep room ID in the field for user to join
                roomIDInput.value = roomID;

            } else {
                // Other error
                console.error('Error status:', response.status, data);
                showNotification('Error', data.message || 'Failed to create room', 'error');
            }

        } catch (error) {
            console.error('Create room error:', error);
            showNotification('Error', 'Connection failed: ' + error.message, 'error');
        } finally {
            createRoomBtn.disabled = false;
            createRoomBtn.innerHTML = '<i class="fas fa-plus"></i> Create';
        }
    });
} else {
    console.error('createRoomBtn element not found in DOM');
}

/* ============================================
   Reset Room Functionality
   ============================================ */

if (resetRoomBtn) {
    resetRoomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Hide error box when user resets
        if (roomErrorBox) {
            roomErrorBox.classList.add('hidden');
        }
        // Re-enable room ID input and hide reset button
        roomIDInput.disabled = false;
        roomIDInput.value = '';
        roomIDInput.focus();
        resetRoomBtn.classList.add('hidden');
        showNotification('Info', 'Enter a new room ID and click Create.', 'info');
    });
} else {
    console.warn('resetRoomBtn element not found in DOM');
}

/* ============================================
   Socket.IO Event Handlers
   ============================================ */

// When user joins room successfully
socket.on('joined-room', ({ clients, username, socketID }) => {
    currentSocketID = socketID;

    // Switch to editor view
    joinModal.classList.remove('active');
    editorView.classList.remove('hidden');

    // Update UI
    roomDisplay.textContent = currentRoom;
    currentUserDisplay.innerHTML = `<strong>You:</strong> ${username} <span class="member-badge">You</span>`;

    // Update members list
    updateMembersList(clients);

    // Request code sync for new user
    socket.emit('sync-code', { socketID: currentSocketID, code: '' });

    // Show notification
    showNotification('Success', `Welcome to room: ${currentRoom}`, 'success');
});

// Handle code changes from other users
socket.on('code-change', ({ code }) => {
    if (!isUpdatingCode) {
        // Store cursor position
        const cursorPos = codeEditor.selectionStart;

        // Update code
        codeEditor.value = code;

        // Restore cursor position
        codeEditor.selectionStart = Math.min(cursorPos, code.length);
        codeEditor.selectionEnd = cursorPos;
    }
});

// Handle user disconnection
socket.on('user-disconnected', ({ socketID, username }) => {
    showNotification('Member Left', `${username} left the room`, 'warning');
});

// Handle updated members list after someone disconnects
socket.on('update-members', ({ clients }) => {
    console.log('=== UPDATE-MEMBERS EVENT RECEIVED ===');
    console.log('Received clients array:', clients);
    console.log('Number of clients:', clients ? clients.length : 0);
    updateMembersList(clients);
});

// Handle typing notification
socket.on('userTyping', (username) => {
    typingText.textContent = `${username} is typing...`;
    typingIndicator.classList.remove('hidden');

    // Clear previous timeout
    clearTimeout(typingTimeout);

    // Hide typing indicator after 3 seconds of inactivity
    typingTimeout = setTimeout(() => {
        typingIndicator.classList.add('hidden');
    }, 3000);
});

// Handle language change
socket.on('language-change', (username, language) => {
    console.log(`${username} changed language to ${language}`);

    // Update the language selector dropdown for all users
    if (languageSelect) {
        languageSelect.value = language;
        currentLanguage = language;
    }

    showNotification('Language Changed', `${username} changed language to ${language}`, 'info');
});

// Handle connection events
socket.on('connect', () => {
    updateConnectionStatus(true);
    console.log('Connected to server:', socket.id);
});

socket.on('disconnect', () => {
    updateConnectionStatus(false);
    console.log('Disconnected from server');

    // Reset to join modal if disconnected
    if (currentRoom) {
        showNotification('Disconnected', 'Connection lost. Please refresh to reconnect.', 'error');
    }
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    showNotification('Connection Error', 'Failed to connect to server', 'error');
});

/* ============================================
   Code Editor Event Handlers
   ============================================ */

// Debounce helper for code changes
function debounce(func, delay) {
    let timeoutID;
    return function (...args) {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => func(...args), delay);
    };
}

// Handle code editor input with debounce (300ms)
const handleCodeChange = debounce(() => {
    if (currentRoom && currentUsername) {
        const code = codeEditor.value;
        isUpdatingCode = true;

        // Emit code change to server
        socket.emit('code-change', { roomID: currentRoom, code });

        isUpdatingCode = false;

        // Emit typing indicator
        socket.emit('typing', { roomID: currentRoom, username: currentUsername });
    }
}, 300);

codeEditor.addEventListener('input', handleCodeChange);

// Tab key support in textarea
codeEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();

        const start = codeEditor.selectionStart;
        const end = codeEditor.selectionEnd;
        const value = codeEditor.value;

        // Insert tab character
        codeEditor.value = value.substring(0, start) + '\t' + value.substring(end);

        // Move cursor after tab
        codeEditor.selectionStart = codeEditor.selectionEnd = start + 1;

        // Trigger code change event
        handleCodeChange();
    }
});

/* ============================================
   Language Change Functionality
   ============================================ */

if (languageSelect) {
    languageSelect.addEventListener('change', () => {
        currentLanguage = languageSelect.value;

        // Emit language change event to server
        socket.emit('change-lang', {
            roomID: currentRoom,
            username: currentUsername,
            langauge: currentLanguage,
        });

        showNotification('Language Changed', `Language switched to ${currentLanguage}`, 'info');
    });
}

/* ============================================
   Leave Room Functionality
   ============================================ */

leaveBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to leave the room?')) {
        // Reset UI
        editorView.classList.add('hidden');
        joinModal.classList.add('active');
        codeEditor.value = '';
        membersList.innerHTML = '';

        // Disconnect socket
        socket.disconnect();

        // Reset state
        currentRoom = null;
        currentUsername = null;
        currentSocketID = null;

        showNotification('Left', 'You have left the room', 'info');
    }
});

/* ============================================
   Keyboard Shortcuts
   ============================================ */

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus code editor
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        codeEditor.focus();
    }
});

/* ============================================
   Initial Setup
   ============================================ */

// Set initial focus on username input
window.addEventListener('load', () => {
    usernameInput.focus();
});

console.log('Code Collaboration App - Client Ready');
console.log('Socket.IO initialized and waiting for connections');
