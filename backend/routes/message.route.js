import { Router } from 'express';
import admin from 'firebase-admin';
import { db } from '../config/firebase-admin.js';

const router = Router();

router.get('/history/:userId1/:userId2', async (req, res) => {
    const { userId1, userId2 } = req.params;
    const { limit = 50 } = req.query;

    try {
        const allMessagesSnapshot = await db.collection('messages').get();

        const conversationId = [userId1, userId2].sort().join('_');

        const filteredMessages = allMessagesSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }))
            .filter(msg => {
                if (msg.conversationId) {
                    return msg.conversationId === conversationId;
                }
                return (msg.senderId === userId1 && msg.receiverId === userId2) ||
                    (msg.senderId === userId2 && msg.receiverId === userId1);
            })
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .slice(0, parseInt(limit));

        res.json(filteredMessages);

    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const allMessagesSnapshot = await db.collection('messages').get();

        const userMessages = allMessagesSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }))
            .filter(msg =>
                msg.senderId === userId || msg.receiverId === userId
            );

        const conversations = {};

        userMessages.forEach(msg => {
            let partnerId, partnerName;

            if (msg.participants) {
                partnerId = msg.participants.find(p => p !== userId);
                partnerName = msg.senderId === userId ? msg.receiverName : msg.senderName;
            } else {
                partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
                partnerName = msg.senderId === userId ? msg.receiverName : msg.senderName;
            }

            if (partnerId && (!conversations[partnerId] || conversations[partnerId].timestamp < msg.timestamp)) {
                conversations[partnerId] = {
                    partnerId,
                    partnerName,
                    isMeSend: msg.senderId === userId,
                    lastMessage: msg.message,
                    timestamp: msg.timestamp,
                    read: msg.read
                };
            }
        });

        const conversationList = Object.values(conversations)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(conversationList);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/unread/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const allMessagesSnapshot = await db.collection('messages').get();

        const unreadMessages = allMessagesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(msg => msg.receiverId === userId && msg.read === false);

        const unreadCount = unreadMessages.length;

        // Group unread messages by sender
        const unreadBySender = {};
        unreadMessages.forEach(msg => {
            if (!unreadBySender[msg.senderId]) {
                unreadBySender[msg.senderId] = 0;
            }
            unreadBySender[msg.senderId]++;
        });

        res.json({
            totalUnread: unreadCount,
            unreadBySender
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/mark-read', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        if (!senderId || !receiverId) {
            return res.status(400).json({ error: 'senderId and receiverId are required' });
        }

        // Get all messages and filter in JavaScript
        const allMessagesSnapshot = await db.collection('messages').get();

        const unreadMessages = allMessagesSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.senderId === senderId &&
                data.receiverId === receiverId &&
                data.read === false;
        });

        // Update all to read
        const batch = db.batch();
        unreadMessages.forEach(doc => {
            batch.update(doc.ref, {
                read: true,
                readAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();

        res.json({
            success: true,
            markedCount: unreadMessages.length
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;