var admin = require("firebase-admin");

var serviceAccount = require("../secret/firebase.json");

var firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://licenta-ff387.firebaseio.com"
});

module.exports = {
    database: firebase.database()
};