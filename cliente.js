// LISTAR VENDEDORES
onSnapshot(collection(db, "usuarios"), (snapshot) => {
  lista.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const v = docSnap.data();
    const idDoc = docSnap.id; // Firestore ID

    // Corrige compatibilidade com dados antigos:
    const tipo = v.tipo || "";
    const ativo = v.status === true || v.status === "ativo";

    if (tipo === "vendedor") {
      const card = document.createElement("div");
      card.className = "vendedor-card";

      const precoGas = parseFloat(v.produtos?.gas?.preco || 0);
      const precoAgua = parseFloat(v.produtos?.agua?.preco || 0);

      card.innerHTML = `
        <img src="${v.foto || 'https://via.placeholder.com/80'}" class="foto-vendedor">
        <div class="info-vendedor">
          <h3>${v.nome}</h3>
          <div class="produtos">
            ${v.produtos?.gas?.ativo ? `
              <div class="produto" data-tipo="gas" data-vendedor="${idDoc}">
                <span>🔥</span>
                <div class="acoes">
                  <button class="btn-contador menos">−</button>
                  <span class="contador">0</span>
                  <button class="btn-contador mais">+</button>
                </div>
                <span class="preco">R$ ${precoGas}</span>
              </div>` : ""}

            ${v.produtos?.agua?.ativo ? `
              <div class="produto" data-tipo="agua" data-vendedor="${idDoc}">
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

      // Se quiser mostrar apenas vendedores ativos
      if (!ativo) {
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
      }

      // Lógica dos botões + e −
      const botoes = card.querySelectorAll(".btn-contador");
      botoes.forEach(btn => {
        btn.addEventListener("click", () => {
          const produto = btn.closest(".produto");
          const tipo = produto.dataset.tipo;
          const idVendedor = produto.dataset.vendedor;
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

          // Registra o item no carrinho local
          let existente = pedidosPendentes.find(p => p.idVendedor === idVendedor);
          if (!existente) {
            pedidosPendentes.push({
              idVendedor,
              nomeVendedor: v.nome,
              produtos: { gas: 0, agua: 0 },
              precoGas,
              precoAgua
            });
            existente = pedidosPendentes.find(p => p.idVendedor === idVendedor);
          }
          existente.produtos[tipo] = valor;
        });
      });

      lista.appendChild(card);
    }
  });
});
