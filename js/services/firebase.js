import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Configuração do Firebase. Substitua com as credenciais do seu console do Firebase!
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForInitializationOnly",
  authDomain: "obsenac-demo.firebaseapp.com",
  projectId: "obsenac-demo",
  storageBucket: "obsenac-demo.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Se o usuário já tiver configurado as credenciais em um objeto global no index.html ou quiser usar as do projeto
const config = window.FIREBASE_CONFIG || firebaseConfig;

const app = initializeApp(config);
export const db = getFirestore(app);

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
};


