import firebase from "firebase";
require("@firebase/firestore");

var firebaseConfig = {
  apiKey: "AIzaSyAagqpijiH9j9eM8UAVBDKEfWE_6X_DUvU",
  authDomain: "allaboutyou-e1370.firebaseapp.com",
  projectId: "allaboutyou-e1370",
  storageBucket: "allaboutyou-e1370.appspot.com",
  messagingSenderId: "1005360579029",
  appId: "1:1005360579029:web:e151157dde74232eb47d5c",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase.firestore();
