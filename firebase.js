// Importações Firebase (versão modular mais recente)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAikIUwmm0OYzj98N_NmKlyA4C2-7mE_Lw",
  authDomain: "olhaogas-diamantina.firebaseapp.com",
  projectId: "olhaogas-diamantina",
  storageBucket: "olhaogas-diamantina.firebasestorage.app",
  messagingSenderId: "225790866999",
  appId: "1:225790866999:web:00a7bb5213c39c3fbff1b2",
  measurementId: "G-LPQCBNGH4Z"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
