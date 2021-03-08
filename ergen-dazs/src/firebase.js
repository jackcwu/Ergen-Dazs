import firebase from 'firebase/app';
import 'firebase/firestore';
// https://www.youtube.com/watch?v=3ZEz-iposj8

const firebaseConfig = {
  apiKey: 'AIzaSyAWtsofBoUbXGVL3wVxilbm2kb4ZCuZf4U',
  authDomain: 'ergen-dazs.firebaseapp.com',
  projectId: 'ergen-dazs',
  storageBucket: 'ergen-dazs.appspot.com',
  messagingSenderId: '539315257955',
  appId: '1:539315257955:web:dea37be15bb9344c456e56',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}
export default firebase;
