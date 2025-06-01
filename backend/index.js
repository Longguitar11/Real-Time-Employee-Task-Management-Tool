import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import admin from 'firebase-admin';
import cookieParser from 'cookie-parser';
import { CLIENT_URL, PORT } from './config/env.js';
import authRoutes from './routes/auth.route.js';
import employeeRoutes from './routes/employee.route.js';
import taskRoutes from './routes/task.route.js';
import messageRoutes from './routes/message.route.js';
import { db } from './config/firebase-admin.js';

const app = express();
const server = createServer(app);

// Configure CORS
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));

// Configure Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

// Store connected users
const connectedUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining
    socket.on('join', (userData) => {
        socket.join(userData.userId);
        socket.userData = userData;
        connectedUsers.set(userData.userId, {
            socketId: socket.id,
            ...userData
        });

        console.log(`${userData.email} (${userData.role}) joined room: ${userData.userId}`);

        // Notify others that user is online
        socket.broadcast.emit('userOnline', {
            userId: userData.userId,
            name: userData.name || userData.email,
            role: userData.role
        });
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            const { senderId, receiverId, message, senderName, senderRole } = messageData;

            // Create conversation ID
            const conversationId = [senderId, receiverId].sort().join('_');

            const messageDoc = {
                senderId,
                receiverId,
                message,
                senderName,
                senderRole,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                read: false,
                conversationId,
                participants: [senderId, receiverId]
            };

            const docRef = await db.collection('messages').add(messageDoc);
            const savedDoc = await docRef.get();
            const savedMessage = {
                id: savedDoc.id,
                ...savedDoc.data(),
                timestamp: savedDoc.data().timestamp?.toDate()
            };

            io.to(senderId).emit('messageConfirmed', savedMessage);
            io.to(receiverId).emit('receiveMessage', savedMessage);

        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('messageError', { error: 'Failed to send message' });
        }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
        const { receiverId, senderId, senderName } = data;

        // Send typing indicator to receiver
        io.to(receiverId).emit('userTyping', {
            senderId,
            senderName
        });
    });

    socket.on('stopTyping', (data) => {
        const { receiverId, senderId } = data;

        // Send stop typing indicator to receiver
        io.to(receiverId).emit('userStoppedTyping', {
            senderId
        });
    });

    // Handle marking messages as read
    socket.on('markAsRead', async (data) => {
        try {
            const { senderId, receiverId } = data;

            // Update all unread messages between these users
            const messagesQuery = await db.collection('messages')
                .where('senderId', '==', senderId)
                .where('receiverId', '==', receiverId)
                .where('read', '==', false)
                .get();

            const batch = db.batch();
            messagesQuery.docs.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });

            await batch.commit();

            // Notify sender that messages were read
            io.to(senderId).emit('messagesRead', {
                readBy: receiverId,
                count: messagesQuery.docs.length
            });

        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Find and remove user from connected users
        let disconnectedUser = null;
        for (const [userId, userData] of connectedUsers.entries()) {
            if (userData.socketId === socket.id) {
                disconnectedUser = userData;
                connectedUsers.delete(userId);
                break;
            }
        }

        if (disconnectedUser) {
            // Notify others that user is offline
            socket.broadcast.emit('userOffline', {
                userId: disconnectedUser.userId,
                name: disconnectedUser.name || disconnectedUser.email
            });
        }
    });

    // Handle getting online users
    socket.on('getOnlineUsers', () => {
        const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
            userId: user.userId,
            name: user.name || user.email,
            role: user.role
        }));

        socket.emit('onlineUsers', onlineUsers);
    });
});

// Make io available to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        connectedUsers: connectedUsers.size
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.io server is ready for connections`);
});

// Export io for use in other files if needed
export { io };