import { db } from "./firebase.js";
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) {
  alert("Faça login novamente.");
  window.location.href = "index.html";
}

const listaPendentes = document.getElementById("listaPendentes");
const listaEmEntrega = document.getElementById("listaEmEntrega");
const listaEntregues = document.getElementById("listaEntregues");

const modal = document.getElementById("modalDetalhes");
const infoPedido = document.getElementById("infoPedido");
const fecharModal = document.getElementById("fecharModal");

fecharModal.addEventListener("click", () => modal.style.display = "none");

// Busca pedidos do cliente em tempo real
const q = query(collection(db, "pedidos"), where("idCliente", "==", usuarioLogado.id));
onSnapshot(q, (snapshot) => {
  listaPendentes.innerHTML = "";
  listaEmEntrega.innerHTML = "";
  listaEntregues.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const p = docSnap.data();

    const card = document.createElement("div");
    card.className = `pedido-card ${p.statusPedido}`;
    card.innerHTML = `
      <h4>${p.nomeVendedor}</h4>
      <p>🔥 Gás: ${p.produtos.gas.quantidade} x R$ ${p.produtos.gas.precoUnitario}</p>
      <p>💧 Água: ${p.produtos.agua.quantidade} x R$ ${p.produtos.agua.precoUnitario}</p>
      <p><strong>Total: R$ ${p.totalPedido.toFixed(2)}</strong></p>
      <span class="status ${p.statusPedido}">${traduzirStatus(p.statusPedido)}</span><br>
      <button class="btn-detalhes">Ver Detalhes</button>
    `;

    card.querySelector(".btn-detalhes").addEventListener("click", () => {
      mostrarDetalhes(p);
    });

    if (p.statusPedido === "pendente") listaPendentes.appendChild(card);
    else if (p.statusPedido === "em_entrega") listaEmEntrega.appendChild(card);
    else listaEntregues.appendChild(card);
  });
});

function traduzirStatus(status) {
  if (status === "pendente") return "Aguardando entrega";
  if (status === "em_entrega") return "Em entrega";
  if (status === "entregue") return "Entregue";
  return "Indefinido";
}

function mostrarDetalhes(p) {
  modal.style.display = "flex";
  infoPedido.innerHTML = `
    <p><strong>Vendedor:</strong> ${p.nomeVendedor}</p>
    <p><strong>Itens:</strong></p>
    <p>🔥 Gás: ${p.produtos.gas.quantidade} x R$ ${p.produtos.gas.precoUnitario}</p>
    <p>💧 Água: ${p.produtos.agua.quantidade} x R$ ${p.produtos.agua.precoUnitario}</p>
    <p><strong>Total:</strong> R$ ${p.totalPedido.toFixed(2)}</p>
    <p><strong>Status:</strong> ${traduzirStatus(p.statusPedido)}</p>
    <p><strong>Pagamento:</strong> ${p.statusPagamento}</p>
    <button style="background:#25D366;color:white;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;" onclick="window.open('https://wa.me/55XXXXXXXXXX','_blank')">📞 Contatar vendedor</button>
  `;
}
