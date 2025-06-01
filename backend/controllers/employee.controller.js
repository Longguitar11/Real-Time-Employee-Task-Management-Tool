import admin from "firebase-admin";
import { db } from "../config/firebase-admin.js";
import { transporter } from "../config/nodemailer.js";
import { mailOptions } from "../utils/mailOptions.js";
import { CLIENT_LOGIN_URL, MY_EMAIL } from "../config/env.js";

export const createEmployee = async (req, res) => {
    const { name, email, phoneNumber, department, role } = req.body;
    const userId = req.user.id;

    try {
        const existingUserQuery = await db.collection('users').where("email", "==", email).get();

        if (!existingUserQuery.empty) {
            return res.status(400).json({ error: "User with this email already exists." });
        }

        // Let Firebase generate a random ID
        const docRef = await db.collection('users').add({
            createdBy: userId,
            name,
            email,
            phoneNumber,
            role,
            department,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        docRef.update({
            id: docRef.id,
        });

        await transporter.sendMail(mailOptions(email, 'Welcome to Real-Time Employee Task Management Tool',
            `
                <h2>Welcome, ${name}!</h2>
                <p>You have been successfully added as an employee in our Real-Time Employee Task Management Tool.</p>
                <p>Your role is: <strong>${role}</strong></p>
                <p>For any assistance, please contact us at ${MY_EMAIL}.</p>
                <p>Please click on the verification link to set up your account: ${CLIENT_LOGIN_URL}</p>
            `
        ));

        res.json({ success: true, employeeId: docRef.id, employee: { id: docRef.id, name, email, phoneNumber, department, role } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => doc.data());

        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const getAllEmployees = async (req, res) => {
    try {
        const snapshot = await db.collection('users').where('role', '==', 'employee').get();
        const employees = snapshot.docs.map(doc => doc.data());

        res.json({ success: true, employees });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const getEmployeeById = async (req, res) => {
    const { id } = req.params;

    try {
        const employeeDoc = await db.collection('users').doc(id).get();
        if (!employeeDoc.exists) {
            return res.status(404).json({ error: "Employee not found." });
        }

        res.json({ success: true, employee: employeeDoc.data() });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const deleteEmployeeById = async (req, res) => {
    const { id } = req.params;

    try {
        const employeeDoc = await db.collection('users').doc(id).get();
        if (!employeeDoc.exists) {
            return res.status(404).json({ error: "Employee not found." });
        }

        await db.collection('users').doc(id).delete();
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const updateEmployeeById = async (req, res) => {
    const { id } = req.params;
    const { name, email, phoneNumber, department, role } = req.body;

    try {
        const employeeDoc = await db.collection('users').doc(id).get();

        if (!employeeDoc.exists) {
            return res.status(404).json({ error: "Employee not found." });
        }

        const currentUserData = employeeDoc.data();

        if (email !== currentUserData.email) {
            const emailCheckQuery = await db.collection('users')
                .where("email", "==", email)
                .get();

            if (!emailCheckQuery.empty) {
                const emailExists = emailCheckQuery.docs.some(doc => doc.id !== id);

                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        error: "This email is already in use by another account."
                    });
                }
            }

            await employeeDoc.ref.update({
                email,
                name,
                phoneNumber,
                department,
                role,
                isVerified: false,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            try {
                await transporter.sendMail(mailOptions(email, 'Email Verification Required',
                    `
                    <h2>Hello ${name},</h2>
                    <p>You have updated your email address in our Real-Time Employee Task Management Tool.</p>
                    <p>Please verify your new email address by clicking the link below:</p>
                    <p><a href="${CLIENT_LOGIN_URL}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
                    <p>If you did not make this change, please contact your administrator immediately.</p>
                  `
                ));
            } catch (emailError) {
                console.error("Failed to send verification email:", emailError);
            }
        } else {
            await employeeDoc.ref.update({
                name,
                phoneNumber,
                department,
                role,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        res.json({
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}
