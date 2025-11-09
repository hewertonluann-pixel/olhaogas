import { db } from "./firebase.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const lista = document.getElementById("lista-vendedores");
const carrinhoFlutuante = document.getElementById("carrinhoFlutuante");
const contadorCarrinho = document.getElementById("contadorCarrinho");

let totalItens = 0;

// Atualiza contador e visibilidade do carrinho
function atualizarCarrinho() {
  if (totalItens > 0) {
    contadorCarrinho.textContent = totalItens;
    carrinhoFlutuante.style.display = "flex";
  } else {
    carrinhoFlutuante.style.display = "none";
  }
}

carrinhoFlutuante.addEventListener("click", () => {
  window.location.href = "pedidos.html";
});

// === LISTA DE VENDEDORES ===
onSnapshot(collection(db, "usuarios"), (snapshot) => {
  lista.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const v = docSnap.data();
    if (v.tipo === "vendedor") {
      const ativo = v.status === true || v.status === "ativo";
      const precoGas = parseFloat(v.produtos?.gas?.preco || 0);
      const precoAgua = parseFloat(v.produtos?.agua?.preco || 0);
      const media = parseFloat(v.reputacao?.media || 0);
      const estrelas = gerarEstrelas(media);

      const card = document.createElement("div");
      card.className = "vendedor-card";

      card.innerHTML = `
        <img src="${v.foto || 'https://via.placeholder.com/70'}" class="foto-vendedor" alt="foto">
        <div class="vendedor-info">
          <h3>${v.nome}</h3>
          <div class="estrelas">${estrelas}</div>

          ${v.produtos?.gas?.ativo ? `
            <div class="produto" data-tipo="gas">
              <div class="preco-canto">R$ ${precoGas}</div>
              <img src="imagens/gas.png" class="icone-produto" alt="Gás">
              <div class="acoes">
                <button class="btn-contador menos">➖</button>
                <span class="contador">0</span>
                <button class="btn-contador mais">➕</button>
              </div>
            </div>` : ""}

          ${v.produtos?.agua?.ativo ? `
            <div class="produto" data-tipo="agua">
              <div class="preco-canto">R$ ${precoAgua}</div>
              <img src="imagens/agua.png" class="icone-produto" alt="Água">
              <div class="acoes">
                <button class="btn-contador menos">➖</button>
                <span class="contador">0</span>
                <button class="btn-contador mais">➕</button>
              </div>
            </div>` : ""}
        </div>

        ${ativo ? `<div class="bolinha-ativa"></div>` : ""}
      `;

      if (!ativo) {
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
      }

      // Controle dos botões + e –
      const botoes = card.querySelectorAll(".btn-contador");
      botoes.forEach(btn => {
        btn.addEventListener("click", () => {
          const produto = btn.closest(".produto");
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
        });
      });

      lista.appendChild(card);
    }
  });
});

// === Função para gerar estrelas visuais ===
function gerarEstrelas(media) {
  const total = 5;
  let estrelasHTML = "";
  for (let i = 1; i <= total; i++) {
    estrelasHTML += i <= Math.round(media)
      ? '<span class="estrela cheia">⭐</span>'
      : '<span class="estrela vazia">☆</span>';
  }
  return estrelasHTML;
}
