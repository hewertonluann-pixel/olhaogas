import { db } from "./firebase.js";
import {
  collection, onSnapshot, addDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const lista = document.getElementById("lista-vendedores");
const carrinhoFlutuante = document.getElementById("carrinhoFlutuante");
const contadorCarrinho = document.getElementById("contadorCarrinho");
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

let totalItens = 0;
let pedidosPendentes = []; // lista de itens prontos para pedido

// Atualiza contador visual
function atualizarCarrinho() {
  contadorCarrinho.textContent = totalItens;
  carrinhoFlutuante.style.display = totalItens > 0 ? "flex" : "none";
}

// Vai para página de pedidos
carrinhoFlutuante.addEventListener("click", () => {
  window.location.href = "pedidos.html";
});

// LISTAR VENDEDORES
onSnapshot(collection(db, "usuarios"), (snapshot) => {
  lista.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const v = docSnap.data();
    if (v.tipo === "vendedor" && v.status) {
      const card = document.createElement("div");
      card.className = "vendedor-card";

      const idVendedor = docSnap.id;
      const precoGas = parseFloat(v.produtos?.gas?.preco || 0);
      const precoAgua = parseFloat(v.produtos?.agua?.preco || 0);

      card.innerHTML = `
        <img src="${v.foto || 'https://via.placeholder.com/80'}" class="foto-vendedor">
        <div class="info-vendedor">
          <h3>${v.nome}</h3>
          <div class="produtos">
            ${v.produtos?.gas?.ativo ? `
              <div class="produto" data-tipo="gas">
                <span>🔥</span>
                <div class="acoes">
                  <button class="btn-contador menos">−</button>
                  <span class="contador">0</span>
                  <button class="btn-contador mais">+</button>
                </div>
                <span class="preco">R$ ${precoGas}</span>
              </div>` : ""}

            ${v.produtos?.agua?.ativo ? `
              <div class="produto" data-tipo="agua">
                <span>💧</span>
                <div class="acoes">
                  <button class="btn-contador menos">−</button>
                  <span class="contador">0</span>
                  <button class="btn-contador mais">+</button>
                </div>
                <span class="preco">R$ ${precoAgua}</span>
              </div>` : ""}
          </div>
        </div>
      `;

      // lógica dos botões + e −
      const botoes = card.querySelectorAll(".btn-contador");
      botoes.forEach(btn => {
        btn.addEventListener("click", () => {
          const produto = btn.closest(".produto");
          const tipo = produto.dataset.tipo;
          const contadorEl = produto.querySelector(".contador");
          let valor = parseInt(contadorEl.textContent);

          if (btn.classList.contains("mais")) {
            valor++;
            totalItens++;
          } else if (btn.classList.contains("menos") && valor > 0) {
            valor--;
            totalItens--;
          }

          contadorEl.textContent = valor;
          atualizarCarrinho();

          // registra no carrinho local
          const existente = pedidosPendentes.find(p => p.idVendedor === idVendedor);
          if (!existente) {
            pedidosPendentes.push({
              idVendedor,
              nomeVendedor: v.nome,
              produtos: { gas: 0, agua: 0 },
              precoGas,
              precoAgua
            });
          }
          const atual = pedidosPendentes.find(p => p.idVendedor === idVendedor);
          atual.produtos[tipo] = valor;
        });
      });

      lista.appendChild(card);
    }
  });
});

// Quando sair da página (confirmar pedidos)
window.addEventListener("beforeunload", async () => {
  if (totalItens > 0 && usuarioLogado) {
    for (const pedido of pedidosPendentes) {
      const total = (pedido.produtos.gas * pedido.precoGas) +
                    (pedido.produtos.agua * pedido.precoAgua);

      if (total > 0) {
        await addDoc(collection(db, "pedidos"), {
          idCliente: usuarioLogado.id,
          nomeCliente: usuarioLogado.nome,
          idVendedor: pedido.idVendedor,
          nomeVendedor: pedido.nomeVendedor,
          produtos: {
            gas: { quantidade: pedido.produtos.gas, precoUnitario: pedido.precoGas },
            agua: { quantidade: pedido.produtos.agua, precoUnitario: pedido.precoAgua }
          },
          totalPedido: total,
          statusPedido: "pendente",
          statusPagamento: "aguardando",
          metodoPagamento: "na_entrega",
          data: new Date().toISOString()
        });
      }
    }
  }
});
