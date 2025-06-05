import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import { db } from "../config/firebase-admin.js";
import { transporter } from "../config/nodemailer.js";
import { mailOptions } from "../utils/mailOptions.js";
import { generateTokens, setCookies } from "../utils/handleTokens.js";
import { ACCESS_TOKEN_SECRET, CLIENT_LOGIN_URL, MY_EMAIL, NODE_ENV, REFRESH_TOKEN_SECRET } from "../config/env.js";

export const createNewAccessCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if the collection is empty
    const users = db.collection('users');
    const allUsersSnapshot = await users.limit(1).get();


    let userDoc;
    let isNewUser = false;

    if (allUsersSnapshot.empty) {
      // If the collection is empty - Sign up the first user as owner
      const docRef = await users.add({
        email,
        accessCode,
        role: 'owner',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      docRef.update({
        id: docRef.id, // Set the document ID in the document
      })

      userDoc = docRef;
      isNewUser = true;

      console.log(`The first user has been created: ${email}`);
    } else {
      // User exists - Login (update access code)
      const existingUserSnapshot = await users.where('email', '==', email).limit(1).get();

      if (existingUserSnapshot.empty) {
        return res.status(404).json({ error: 'This email is not registered. Only existing users can log in.' });
      }

      userDoc = existingUserSnapshot.docs[0];

      await userDoc.ref.update({ accessCode });

      console.log(`Login attempt for existing user: ${email}`);
    }

    // Send email with access code
    const emailSubject = isNewUser
      ? 'Welcome! Your Access Code - Real-Time Employee Task Management Tool'
      : 'Your Login Access Code - Real-Time Employee Task Management Tool';

    const emailContent = isNewUser
      ? `
        <h2>Welcome to Task Management!</h2>
        <p>Your account has been created successfully.</p>
        <p>Your 6-digit access code is: <strong>${accessCode}</strong></p>
        <p>Use this code to complete your registration.</p>
      `
      : `
        <h2>Your Login Access Code</h2>
        <p>Your 6-digit access code is: <strong>${accessCode}</strong></p>
        <p>Use this code to log in to your account.</p>
      `;

    await transporter.sendMail(mailOptions(email, emailSubject, emailContent));

    res.json({ success: true });
  } catch (error) {
    console.error('Error in createNewAccessCode:', error);
    res.status(500).json({ error: error.message });
  }
}

export const validateAccessCode = async (req, res) => {
  try {
    const { accessCode, email } = req.body;

    const userQuery = await db.collection('users').where('email', '==', email).get();

    if (userQuery.empty) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get the first document from the query results
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    if (userData.accessCode === accessCode) {
      // Update the document using the reference
      await userDoc.ref.update({
        accessCode: "",
        isVerified: true,
      });

      // Generate tokens and set cookies
      const { accessToken, refreshToken } = generateTokens(userDoc.id);
      setCookies(res, accessToken, refreshToken);

      res.json({ success: true, user: userDoc.data() });
    } else {
      res.status(400).json({ success: false, error: "Invalid access code" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token not found." });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const userId = decoded.userId;

    // Generate new access token
    const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error in refreshAccessToken:', error);
    res.status(500).json({ error: error.message });
  }
}

export const getProfile = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ error: error.message });
  }
}

export const editProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, phoneNumber, department, role } = req.body;

  try {
    const employeeDoc = await db.collection('users').doc(userId).get();

    if (!employeeDoc.exists) {
      return res.status(404).json({ error: "Employee not found." });
    }

    const currentUserData = employeeDoc.data();

    if (email !== currentUserData.email) {
      const emailCheckQuery = await db.collection('users')
        .where("email", "==", email)
        .get();

      if (!emailCheckQuery.empty) {
        const emailExists = emailCheckQuery.docs.some(doc => doc.id !== userId);

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
      message: email !== currentUserData.email ?
        "Profile updated successfully. Please verify your new email address." :
        "Profile updated successfully."
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: error.message });
  }
}

export const logout = (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ error: error.message });
  }
}


