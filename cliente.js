import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const lista = document.getElementById("lista-vendedores");
const carrinhoFlutuante = document.getElementById("carrinhoFlutuante");
const contadorCarrinho = document.getElementById("contadorCarrinho");

let totalItens = 0;
let vendedoresFavoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

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

onSnapshot(collection(db, "usuarios"), (snapshot) => {
  lista.innerHTML = "";
  const vendedores = [];

  snapshot.forEach((docSnap) => {
    const v = docSnap.data();
    if (v.tipo === "vendedor") {
      vendedores.push({ id: docSnap.id, ...v });
    }
  });

  // Ordena: favoritos > ativos > inativos
  vendedores.sort((a, b) => {
    const favA = vendedoresFavoritos.includes(a.id);
    const favB = vendedoresFavoritos.includes(b.id);
    if (favA !== favB) return favB - favA;
    return (b.status === true) - (a.status === true);
  });

  // Monta cada card
  vendedores.forEach((v) => {
    const ativo = v.status === true || v.status === "ativo";
    const precoGas = parseFloat(v.produtos?.gas?.preco || 0);
    const precoAgua = parseFloat(v.produtos?.agua?.preco || 0);
    const media = parseFloat(v.reputacao?.media || 0);
    const estrelas = gerarEstrelas(media);
    const isFav = vendedoresFavoritos.includes(v.id);

    const card = document.createElement("div");
    card.className = "vendedor-card";

    card.innerHTML = `
      <div class="favorito" data-id="${v.id}">
        ${isFav ? "❤️" : "🤍"}
      </div>
      <img src="${v.foto || 'https://via.placeholder.com/70'}" class="foto-vendedor" alt="foto">
      <div class="vendedor-info">
        <h3>${v.nome}</h3>
        <div class="estrelas">${estrelas}</div>

        <div class="produtos">
          ${v.produtos?.gas?.ativo ? `
            <div class="produto" data-tipo="gas">
              <div class="preco-faixa">R$ ${precoGas}</div>
              <div class="linha-produto">
                <img src="imagens/gas.png" class="icone-produto" alt="Gás">
                <div class="acoes">
                  <button class="btn-contador menos">➖</button>
                  <span class="contador">0</span>
                  <button class="btn-contador mais">➕</button>
                </div>
              </div>
            </div>` : ""}

          ${v.produtos?.agua?.ativo ? `
            <div class="produto" data-tipo="agua">
              <div class="preco-faixa">R$ ${precoAgua}</div>
              <div class="linha-produto">
                <img src="imagens/agua.png" class="icone-produto" alt="Água">
                <div class="acoes">
                  <button class="btn-contador menos">➖</button>
                  <span class="contador">0</span>
                  <button class="btn-contador mais">➕</button>
                </div>
              </div>
            </div>` : ""}
        </div>
      </div>
      ${ativo ? `<div class="bolinha-ativa"></div>` : ""}
    `;

    if (!ativo) {
      card.style.opacity = "0.5";
      card.style.pointerEvents = "none";
    }

    // Controle + / −
    card.querySelectorAll(".btn-contador").forEach(btn => {
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

    // Favoritar vendedor
    card.querySelector(".favorito").addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      if (vendedoresFavoritos.includes(id)) {
        vendedoresFavoritos = vendedoresFavoritos.filter(x => x !== id);
      } else {
        vendedoresFavoritos.push(id);
      }
      localStorage.setItem("favoritos", JSON.stringify(vendedoresFavoritos));
      onSnapshot(collection(db, "usuarios"), () => {}); // Força recarregar visual
    });

    lista.appendChild(card);
  });
});

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
