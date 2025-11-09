import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// === elementos da interface ===
const listaPedidos = document.getElementById("listaPedidos");
const modal = document.getElementById("modalDetalhes");
const infoPedido = document.getElementById("infoPedido");
const btnFechar = document.getElementById("btnFechar");

// === identificação do cliente ===
const cliente = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!cliente) {
  alert("Faça login para ver seus pedidos.");
  window.location.href = "index.html";
}

// === consulta em tempo real ===
const q = query(collection(db, "pedidos"), where("idCliente", "==", cliente.id || cliente.uid));

onSnapshot(q, (snapshot) => {
  listaPedidos.innerHTML = "";

  if (snapshot.empty) {
    listaPedidos.innerHTML = `<p style="text-align:center;color:#ccc;">Você ainda não fez nenhum pedido.</p>`;
    return;
  }

  snapshot.forEach((docSnap) => {
    const pedido = { id: docSnap.id, ...docSnap.data() };
    const card = document.createElement("div");
    card.className = "pedido-card";
    card.innerHTML = `
      <h3>${pedido.nomeVendedor}</h3>
      <p><strong>Status:</strong> ${pedido.statusPedido || "pendente"}</p>
      <p><strong>Total:</strong> R$ ${pedido.totalPedido?.toFixed(2) || 0}</p>
      <button class="btn-detalhes">Ver detalhes</button>
    `;

    card.querySelector(".btn-detalhes").addEventListener("click", () => mostrarDetalhes(pedido));
    listaPedidos.appendChild(card);
  });
});

// === modal de detalhes ===
function mostrarDetalhes(p) {
  modal.style.display = "flex";
  infoPedido.innerHTML = `
    <h3>${p.nomeVendedor}</h3>
    <p><strong>Gás:</strong> ${p.produtos?.gas?.quantidade || 0} x R$ ${p.produtos?.gas?.precoUnitario || 0}</p>
    <p><strong>Água:</strong> ${p.produtos?.agua?.quantidade || 0} x R$ ${p.produtos?.agua?.precoUnitario || 0}</p>
    <p><strong>Total:</strong> R$ ${p.totalPedido?.toFixed(2) || 0}</p>
    <p><strong>Status:</strong> ${p.statusPedido}</p>
    <p><strong>Pagamento:</strong> ${p.statusPagamento || "aguardando"}</p>
  `;

  if (p.statusPedido === "pendente" && p.statusPagamento !== "pago") {
    const btnPagar = document.createElement("button");
    btnPagar.textContent = "💳 Pagar agora";
    btnPagar.classList.add("btn-pagar");
    btnPagar.onclick = () => {
      localStorage.setItem("pedidoSelecionado", JSON.stringify(p));
      window.location.href = "pagamento.html";
    };

    const btnCancelar = document.createElement("button");
    btnCancelar.textContent = "❌ Cancelar pedido";
    btnCancelar.classList.add("btn-cancelar");
    btnCancelar.onclick = async () => {
      if (confirm("Tem certeza que deseja cancelar este pedido?")) {
        await deleteDoc(doc(db, "pedidos", p.id));
        alert("Pedido cancelado com sucesso!");
        modal.style.display = "none";
      }
    };

    infoPedido.appendChild(btnPagar);
    infoPedido.appendChild(btnCancelar);
  }
}

btnFechar.addEventListener("click", () => modal.style.display = "none");
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};
