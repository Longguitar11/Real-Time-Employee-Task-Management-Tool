import admin from "firebase-admin";
import { db } from "../config/firebase-admin.js";

export const createTask = async (req, res) => {
  const { id } = req.params;
  const { name, description, status, deadline } = req.body;
  try {
    const docRef = await db.collection('tasks').add({
      assignedTo: id,
      name,
      description,
      status,
      deadline,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    docRef.update({
        id: docRef.id,
    });

    res.json({ success: true, task: { id: docRef.id, assignedTo: id, name, description, status, deadline } });
  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(500).json({ error: error.message });
  }
}

export const getAllTasks = async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').get();
    const tasks = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error in getAllTasks:', error);
    res.status(500).json({ error: error.message });
  }
}

export const getTasksByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const snapshot = await db.collection('tasks').where('assignedTo', '==', id).get();
    const tasks = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error in getTasksByUserId:', error);
    res.status(500).json({ error: error.message });
  }
}

export const updateTaskById = async (req, res) => {
  const { id } = req.params;
  const { name, description, status, deadline } = req.body;
  try {
    await db.collection('tasks').doc(id).update({
      name,
      description,
      status,
      deadline
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error in updateTaskById:', error);
    res.status(500).json({ error: error.message });
  }
}

export const changeTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
      await db.collection('tasks').doc(id).update({
          status
      });

      res.json({ success: true });
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
  }
}

export const deleteTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('tasks').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error in deleteTaskById:', error);
    res.status(500).json({ error: error.message });
  }
}