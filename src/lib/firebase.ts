import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, onValue, update, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBHJ2OU2QeulNOVzPZ_qeUiOaMGSgKlk3k",
  authDomain: "t-shirt-auroras.firebaseapp.com",
  projectId: "t-shirt-auroras",
  storageBucket: "t-shirt-auroras.firebasestorage.app",
  messagingSenderId: "543258919789",
  appId: "1:543258919789:web:9a1347d0ccb89818ad9064",
  databaseURL: "https://t-shirt-auroras-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
