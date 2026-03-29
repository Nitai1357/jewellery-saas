import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccount = require("../service-account.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin Initialized! ✅");
  } catch (error) {
    console.error("Firebase Admin Error:", error);
  }
}

export { admin };