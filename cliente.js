// Importa o Firestore do SDK e a conexão local (firebase.js)
import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Seleciona o container principal da lista
const lista = document.getElementById("lista-vendedores");

// Teste de conexão com Firebase
console.log("🔥 Testando conexão com Firebase:", db);

// Escuta em tempo real a coleção "usuarios"
onSnapshot(collection(db, "usuarios"), (snapshot) => {
  lista.innerHTML = "";
  let totalVendedores = 0;

  snapshot.forEach((docSnap) => {
    const v = docSnap.data();

    // Filtra apenas vendedores
    if (v.tipo === "vendedor") {
      totalVendedores++;

      const card = document.createElement("div");
      card.className = "vendedor-card";

      const ativo = v.status === true || v.status === "ativo";
      const precoGas = parseFloat(v.produtos?.gas?.preco || 0);
      const precoAgua = parseFloat(v.produtos?.agua?.preco || 0);

      card.innerHTML = `
        <img src="${v.foto || 'https://via.placeholder.com/80'}" class="foto-vendedor" alt="foto">
        <div class="vendedor-info">
          <h3>${v.nome}</h3>
          ${v.produtos?.gas?.ativo ? `<p>🔥 Gás: R$ ${precoGas.toFixed(2)}</p>` : ""}
          ${v.produtos?.agua?.ativo ? `<p>💧 Água: R$ ${precoAgua.toFixed(2)}</p>` : ""}
          <p style="margin-top:6px;font-size:0.9rem;">${ativo ? "🟢 Ativo" : "🔴 Inativo"}</p>
        </div>
      `;

      // Se o vendedor estiver inativo, deixa o card esmaecido
      if (!ativo) {
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
      }

      lista.appendChild(card);
    }
  });

  // Mostra no console quantos vendedores foram carregados
  console.log(`📦 ${totalVendedores} vendedores carregados`);
});
