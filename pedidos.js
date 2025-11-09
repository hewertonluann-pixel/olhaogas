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

// === usuário logado ===
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
  alert("Faça login para ver seus pedidos.");
  window.location.href = "index.html";
}

// === define consulta conforme tipo ===
let q;
if (usuario.tipo === "gerente") {
  // gerente vê todos
  q = collection(db, "pedidos");
} else if (usuario.tipo === "vendedor") {
  // vendedor vê seus pedidos recebidos
  q = query(collection(db, "pedidos"), where("idVendedor", "==", usuario.id));
} else {
  // cliente vê apenas os próprios pedidos
  q = query(collection(db, "pedidos"), where("idCliente", "==", usuario.id));
}

// === escuta em tempo real ===
onSnapshot(q, (snapshot) => {
  listaPedidos.innerHTML = "";

  if (snapshot.empty) {
    listaPedidos.innerHTML = `<p style="text-align:center;color:#ccc;">Nenhum pedido encontrado.</p>`;
    return;
  }

  snapshot.forEach((docSnap) => {
    const p = { id: docSnap.id, ...docSnap.data() };
    const card = document.createElement("div");
    card.className = "pedido-card";

    // === estrutura do card ===
    card.innerHTML = `
      <div class="pedido-info">
        <h3>${p.nomeVendedor || "Vendedor desconhecido"}</h3>
        <p><strong>Cliente:</strong> ${p.nomeCliente || "-"}</p>
        <p><strong>Status:</strong> ${p.statusPedido || "pendente"}</p>
        <p><strong>Pagamento:</strong> ${p.statusPagamento || "aguardando"}</p>
        <p><strong>Total:</strong> R$ ${p.totalPedido?.toFixed(2) || 0}</p>
      </div>
      <div class="acoes-pedido">
        <button class="btn-detalhes">📋 Detalhes</button>
        ${
          usuario.tipo === "cliente" && 
          p.statusPedido === "pendente" &&
          p.statusPagamento !== "pago"
            ? `
              <button class="btn-pagar">💳 Pagar</button>
              <button class="btn-cancelar">❌ Cancelar</button>
            `
            : ""
        }
      </div>
    `;

    // === ações ===
    card.querySelector(".btn-detalhes").addEventListener("click", () => mostrarDetalhes(p));

    const btnPagar = card.querySelector(".btn-pagar");
    if (btnPagar) {
      btnPagar.addEventListener("click", () => {
        localStorage.setItem("pedidoSelecionado", JSON.stringify(p));
        window.location.href = "pagamento.html";
      });
    }

    const btnCancelar = card.querySelector(".btn-cancelar");
    if (btnCancelar) {
      btnCancelar.addEventListener("click", async () => {
        if (confirm("Tem certeza que deseja cancelar este pedido?")) {
          await deleteDoc(doc(db, "pedidos", p.id));
          alert("Pedido cancelado com sucesso!");
        }
      });
    }

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
}

btnFechar.addEventListener("click", () => (modal.style.display = "none"));
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};
