import { db } from "./firebase.js";
import {
  doc, updateDoc, collection, query, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// ===== ELEMENTOS =====
const card = document.getElementById("meuCard");
const btnEditar = document.getElementById("btnEditarCadastro");
const secaoEditar = document.getElementById("secaoEditar");
const btnSalvar = document.getElementById("salvarInfo");
const statusBtn = document.getElementById("botao-status");
const textoStatus = document.getElementById("texto-status");
const bolinha = document.querySelector(".bolinha-status");
const listaPedidos = document.getElementById("listaPedidos");

const marcaGas = document.getElementById("marcaGas");
const precoGas = document.getElementById("precoGas");
const vendeGas = document.getElementById("vendeGas");
const marcaAgua = document.getElementById("marcaAgua");
const precoAgua = document.getElementById("precoAgua");
const vendeAgua = document.getElementById("vendeAgua");
const fotoInput = document.getElementById("foto");

let user = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!user) {
  alert("Faça login novamente.");
  window.location.href = "index.html";
}

// ===== ATUALIZA STATUS VISUAL =====
function atualizarStatusVisual() {
  bolinha.style.background = user.status ? "#00cc66" : "#cc0000";
  textoStatus.textContent = user.status ? "🟢 Fazendo entregas" : "🔴 Fora de serviço";
  statusBtn.textContent = user.status ? "Encerrar Entregas" : "Iniciar Entregas";
}

// ===== MOSTRAR CARD =====
function mostrarCard() {
  card.innerHTML = `
    <img src="${user.foto || 'https://via.placeholder.com/230x140'}" class="foto-vendedor">
    <div class="info">
      <h3>${user.nome}</h3>
      ${user.produtos?.gas?.ativo ? `<p>🔥 Gás 13kg — R$ ${user.produtos.gas.preco}</p>` : ""}
      ${user.produtos?.agua?.ativo ? `<p>💧 Água 20L — R$ ${user.produtos.agua.preco}</p>` : ""}
    </div>
  `;
  atualizarStatusVisual();
}

// ===== ALTERAR STATUS =====
statusBtn.addEventListener("click", async () => {
  user.status = !user.status;
  atualizarStatusVisual();
  await updateDoc(doc(db, "usuarios", user.id), { status: user.status });
  localStorage.setItem("usuarioLogado", JSON.stringify(user));
});

// ===== EDITAR INFORMAÇÕES =====
btnEditar.addEventListener("click", () => {
  secaoEditar.style.display = secaoEditar.style.display === "none" ? "block" : "none";
  if (user.produtos?.gas) {
    marcaGas.value = user.produtos.gas.marca || "";
    precoGas.value = user.produtos.gas.preco || "";
    vendeGas.checked = user.produtos.gas.ativo;
  }
  if (user.produtos?.agua) {
    marcaAgua.value = user.produtos.agua.marca || "";
    precoAgua.value = user.produtos.agua.preco || "";
    vendeAgua.checked = user.produtos.agua.ativo;
  }
});

btnSalvar.addEventListener("click", async () => {
  const file = fotoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      user.foto = reader.result;
      await salvarEdicao();
    };
    reader.readAsDataURL(file);
  } else {
    await salvarEdicao();
  }
});

async function salvarEdicao() {
  user.produtos = {
    gas: {
      ativo: vendeGas.checked,
      marca: marcaGas.value,
      preco: precoGas.value
    },
    agua: {
      ativo: vendeAgua.checked,
      marca: marcaAgua.value,
      preco: precoAgua.value
    }
  };
  await updateDoc(doc(db, "usuarios", user.id), {
    foto: user.foto,
    produtos: user.produtos
  });
  localStorage.setItem("usuarioLogado", JSON.stringify(user));
  mostrarCard();
  alert("✅ Informações salvas com sucesso!");
  secaoEditar.style.display = "none";
}

// ===== PEDIDOS EM TEMPO REAL =====
const q = query(collection(db, "pedidos"), where("idVendedor", "==", user.id));

onSnapshot(q, (snapshot) => {
  listaPedidos.innerHTML = "";

  let pendentes = 0;
  let emEntrega = 0;
  let entregues = 0;

  snapshot.forEach((docSnap) => {
    const p = docSnap.data();

    if (p.statusPedido === "pendente") pendentes++;
    else if (p.statusPedido === "em_entrega") emEntrega++;
    else if (p.statusPedido === "entregue") entregues++;

    const cardPedido = document.createElement("div");
    cardPedido.className = `pedido-card ${p.statusPedido}`;
    cardPedido.innerHTML = `
      <h4>${p.nomeCliente}</h4>
      <p>🔥 Gás: ${p.produtos.gas.quantidade} x R$ ${p.produtos.gas.precoUnitario}</p>
      <p>💧 Água: ${p.produtos.agua.quantidade} x R$ ${p.produtos.agua.precoUnitario}</p>
      <p><strong>Total: R$ ${p.totalPedido.toFixed(2)}</strong></p>
      <p>Pagamento: ${p.statusPagamento}</p>
      <div class="acoes-pedido">
        ${
          p.statusPedido === "pendente"
            ? `<button class="btn-entregar">🚚 Iniciar Entrega</button>`
            : p.statusPedido === "em_entrega"
              ? `<button class="btn-finalizar">✅ Marcar como Entregue</button>`
              : `<p>✅ Entregue</p>`
        }
      </div>
    `;

    const btnEntrega = cardPedido.querySelector(".btn-entregar");
    const btnFinalizar = cardPedido.querySelector(".btn-finalizar");

    if (btnEntrega) {
      btnEntrega.addEventListener("click", async () => {
        await updateDoc(doc(db, "pedidos", docSnap.id), { statusPedido: "em_entrega" });
      });
    }

    if (btnFinalizar) {
      btnFinalizar.addEventListener("click", async () => {
        await updateDoc(doc(db, "pedidos", docSnap.id), { statusPedido: "entregue" });
      });
    }

    listaPedidos.appendChild(cardPedido);
  });

  document.getElementById("qtdPendentes").textContent = pendentes;
  document.getElementById("qtdEntrega").textContent = emEntrega;
  document.getElementById("qtdEntregues").textContent = entregues;
});

mostrarCard();
