const admin = require('firebase-admin');
const serviceAccount = require('../configKeys/amesto-bdb5c-firebase-adminsdk-w68to-06f7dadd02.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
