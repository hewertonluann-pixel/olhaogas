import { db } from "./firebase.js";
import {
  collection, onSnapshot, addDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const lista = document.getElementById("lista-vendedores");
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

onSnapshot(collection(db, "usuarios"), (snapshot) => {
  lista.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const v = docSnap.data();
    if (v.tipo === "vendedor" && v.status) {
      const card = document.createElement("div");
      card.className = "vendedor-card";

      // estrutura do card
      card.innerHTML = `
        <img src="${v.foto || 'https://via.placeholder.com/80'}" class="vendedor-foto">
        <div class="vendedor-info">
          <h3>${v.nome}</h3>
          <p>${v.produtos?.gas?.ativo ? `🔥 Gás ${v.produtos.gas.marca} - R$ ${v.produtos.gas.preco}` : "—"}</p>
          <p>${v.produtos?.agua?.ativo ? `💧 Água ${v.produtos.agua.marca} - R$ ${v.produtos.agua.preco}` : "—"}</p>

          <div class="acoes-produto">
            ${v.produtos?.gas?.ativo ? `<button class="btn-produto" data-tipo="gas">🔥 Gás (0)</button>` : ""}
            ${v.produtos?.agua?.ativo ? `<button class="btn-produto" data-tipo="agua">💧 Água (0)</button>` : ""}
          </div>

          <button class="btn-confirmar">🛒 Confirmar Pedido</button>
        </div>
      `;

      const btns = card.querySelectorAll(".btn-produto");
      const btnConfirmar = card.querySelector(".btn-confirmar");

      let qtdGas = 0;
      let qtdAgua = 0;

      btns.forEach(btn => {
        btn.addEventListener("click", () => {
          const tipo = btn.dataset.tipo;
          const confirma = confirm(`Deseja adicionar mais 1 ${tipo === "gas" ? "botijão de gás" : "galão de água"} ao pedido?`);
          if (confirma) {
            if (tipo === "gas") qtdGas++;
            if (tipo === "agua") qtdAgua++;
            btn.textContent = tipo === "gas" ? `🔥 Gás (${qtdGas})` : `💧 Água (${qtdAgua})`;
            btn.classList.add("ativo");
            atualizarBotao();
          }
        });
      });

      function atualizarBotao() {
        const totalItens = qtdGas + qtdAgua;
        if (totalItens > 0) {
          btnConfirmar.style.display = "block";
          btnConfirmar.textContent = `🛒 Confirmar Pedido (${totalItens})`;
        } else {
          btnConfirmar.style.display = "none";
        }
      }

      btnConfirmar.addEventListener("click", async () => {
        const total =
          (qtdGas * (parseFloat(v.produtos?.gas?.preco || 0))) +
          (qtdAgua * (parseFloat(v.produtos?.agua?.preco || 0)));

        if (total <= 0) {
          alert("Adicione ao menos 1 produto!");
          return;
        }

        const pedido = {
          idCliente: usuarioLogado?.id,
          nomeCliente: usuarioLogado?.nome,
          idVendedor: v.id,
          nomeVendedor: v.nome,
          produtos: {
            gas: { quantidade: qtdGas, precoUnitario: v.produtos?.gas?.preco || 0 },
            agua: { quantidade: qtdAgua, precoUnitario: v.produtos?.agua?.preco || 0 }
          },
          totalPedido: total,
          statusPedido: "pendente",
          statusPagamento: "aguardando",
          metodoPagamento: "na_entrega",
          data: new Date().toISOString()
        };

        await addDoc(collection(db, "pedidos"), pedido);
        alert("✅ Pedido enviado com sucesso!");
        qtdGas = qtdAgua = 0;
        btns.forEach(b => { b.textContent = b.dataset.tipo === "gas" ? "🔥 Gás (0)" : "💧 Água (0)"; b.classList.remove("ativo"); });
        atualizarBotao();
      });

      lista.appendChild(card);
    }
  });
});
