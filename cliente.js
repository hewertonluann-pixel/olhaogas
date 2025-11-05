import { db } from "./firebase.js";
import { collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const lista = document.getElementById("lista-vendedores");
const modal = document.getElementById("modalPedido");
const nomeVendedorPedido = document.getElementById("nomeVendedorPedido");
const qtdGas = document.getElementById("qtdGas");
const qtdAgua = document.getElementById("qtdAgua");
const totalPedido = document.getElementById("totalPedido");
const precoGasPedido = document.getElementById("precoGasPedido");
const precoAguaPedido = document.getElementById("precoAguaPedido");
const confirmarPedido = document.getElementById("confirmarPedido");
const fecharModal = document.getElementById("fecharModal");

let vendedorSelecionado = null;

// LISTAR VENDEDORES EM TEMPO REAL
onSnapshot(collection(db, "usuarios"), (snapshot) => {
  lista.innerHTML = "";
  snapshot.forEach((doc) => {
    const v = doc.data();
    if (v.tipo === "vendedor") {
      const card = document.createElement("div");
      card.className = `vendedor-card ${v.status ? "ativo" : "inativo"}`;
      card.innerHTML = `
        <img src="${v.foto || 'https://via.placeholder.com/230x140'}" alt="foto" class="foto-vendedor">
        <div class="info">
          <h3>${v.nome}</h3>
          ${v.produtos?.gas?.ativo ? `<p>🔥 Gás 13kg - <strong>R$ ${v.produtos.gas.preco}</strong></p>` : ""}
          ${v.produtos?.agua?.ativo ? `<p>💧 Água 20L - <strong>R$ ${v.produtos.agua.preco}</strong></p>` : ""}
          <p>${v.status ? "🟢 Entregando" : "🔴 Indisponível"}</p>
        </div>
        <button class="btn-pedido" ${!v.status ? "disabled" : ""}>Fazer Pedido</button>
      `;

      const btnPedido = card.querySelector(".btn-pedido");
      btnPedido.addEventListener("click", () => abrirModal(v));

      lista.appendChild(card);
    }
  });
});

// ABRIR MODAL
function abrirModal(vendedor) {
  vendedorSelecionado = vendedor;
  nomeVendedorPedido.textContent = vendedor.nome;
  precoGasPedido.textContent = vendedor.produtos?.gas?.ativo ? `R$ ${vendedor.produtos.gas.preco}` : "—";
  precoAguaPedido.textContent = vendedor.produtos?.agua?.ativo ? `R$ ${vendedor.produtos.agua.preco}` : "—";
  qtdGas.value = 0;
  qtdAgua.value = 0;
  totalPedido.textContent = 0;
  modal.style.display = "flex";
}

// FECHAR MODAL
fecharModal.addEventListener("click", () => modal.style.display = "none");

// CALCULAR TOTAL
[qtdGas, qtdAgua].forEach(input => {
  input.addEventListener("input", atualizarTotal);
});

function atualizarTotal() {
  const precoGas = vendedorSelecionado.produtos?.gas?.preco || 0;
  const precoAgua = vendedorSelecionado.produtos?.agua?.preco || 0;
  const total = (qtdGas.value * precoGas) + (qtdAgua.value * precoAgua);
  totalPedido.textContent = total.toFixed(2);
}

// CONFIRMAR PEDIDO
confirmarPedido.addEventListener("click", async () => {
  const total = parseFloat(totalPedido.textContent);
  if (total <= 0) {
    alert("Selecione ao menos 1 produto.");
    return;
  }

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    alert("Faça login para continuar.");
    return;
  }

  const pedido = {
    idCliente: usuarioLogado.id,
    nomeCliente: usuarioLogado.nome,
    idVendedor: vendedorSelecionado.id,
    nomeVendedor: vendedorSelecionado.nome,
    produtos: {
      gas: { quantidade: Number(qtdGas.value), precoUnitario: vendedorSelecionado.produtos?.gas?.preco || 0 },
      agua: { quantidade: Number(qtdAgua.value), precoUnitario: vendedorSelecionado.produtos?.agua?.preco || 0 }
    },
    totalPedido: total,
    statusPedido: "pendente",
    statusPagamento: "aguardando",
    metodoPagamento: "na_entrega",
    data: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, "pedidos"), pedido);
  modal.style.display = "none";

  // Redireciona para página de pagamento
  window.location.href = `pagamento.html?id=${docRef.id}`;
});
