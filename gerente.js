import { db } from "./firebase.js";
import {
  collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Indicadores
const infoVendedores = document.getElementById("infoVendedores");
const barraVendedores = document.getElementById("barraVendedores");
const infoVendas = document.getElementById("infoVendas");
const infoCaixa = document.getElementById("infoCaixa");
const infoReceita = document.getElementById("infoReceita");
const infoReputacao = document.getElementById("infoReputacao");

const TAXA = 0.10; // Comissão da plataforma

// === Vendedores e Reputação ===
onSnapshot(collection(db, "usuarios"), (snap) => {
  const vendedores = snap.docs.filter(d => d.data().tipo === "vendedor");
  const ativos = vendedores.filter(d => d.data().status);
  const perc = (ativos.length / (vendedores.length || 1)) * 100;
  infoVendedores.textContent = `Ativos: ${ativos.length} / ${vendedores.length}`;
  barraVendedores.style.width = `${perc}%`;

  // Média geral de reputação
  const reputacoes = vendedores.map(v => v.data().reputacao?.media).filter(Boolean);
  const mediaGeral = reputacoes.length
    ? (reputacoes.reduce((a,b) => a+b, 0) / reputacoes.length)
    : 0;
  infoReputacao.textContent = mediaGeral ? `${mediaGeral.toFixed(1)} ⭐` : "—";
});

// === Pedidos e Caixa ===
onSnapshot(collection(db, "pedidos"), (snap) => {
  infoVendas.textContent = snap.size;
  let total = 0;
  snap.forEach(docSnap => {
    const p = docSnap.data();
    if (p.statusPagamento === "pago" || p.statusPedido === "concluido")
      total += parseFloat(p.totalPedido || 0);
  });
  infoCaixa.textContent = "R$ " + total.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  infoReceita.textContent = "R$ " + (total * TAXA).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
});

// === Redirecionamento para nova página ===
document.getElementById("abrirGerenciar").addEventListener("click", () => {
  window.location.href = "gerenciar-vendedores.html";
});
