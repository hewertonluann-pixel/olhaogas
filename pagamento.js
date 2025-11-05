import { db } from "./firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const resumo = document.getElementById("resumoPedido");
const btnConfirmar = document.getElementById("btnConfirmarPagamento");

// Pega o ID do pedido na URL
const params = new URLSearchParams(window.location.search);
const idPedido = params.get("id");

if (!idPedido) resumo.textContent = "❌ Pedido não encontrado.";

async function carregarPedido() {
  const ref = doc(db, "pedidos", idPedido);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const p = snap.data();
    resumo.innerHTML = `
      <h3>Vendedor: ${p.nomeVendedor}</h3>
      <p>🔥 Gás: ${p.produtos.gas.quantidade} x R$ ${p.produtos.gas.precoUnitario}</p>
      <p>💧 Água: ${p.produtos.agua.quantidade} x R$ ${p.produtos.agua.precoUnitario}</p>
      <h2>Total: R$ ${p.totalPedido.toFixed(2)}</h2>
      <p>Status do pagamento: <strong>${p.statusPagamento}</strong></p>
    `;
  } else {
    resumo.innerHTML = "<p>❌ Pedido não encontrado.</p>";
  }
}

// Confirmar pagamento (simulado)
btnConfirmar.addEventListener("click", async () => {
  if (!idPedido) return;

  const ref = doc(db, "pedidos", idPedido);
  await updateDoc(ref, {
    statusPagamento: "pago"
  });

  alert("✅ Pagamento confirmado com sucesso (simulado)!");
  window.location.href = "cliente.html";
});

carregarPedido();
