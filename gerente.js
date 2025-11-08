import { db } from "./firebase.js";
import {
  collection, addDoc, onSnapshot, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Elementos do painel
const infoVendedores = document.getElementById("infoVendedores");
const barraVendedores = document.getElementById("barraVendedores");
const infoVendas = document.getElementById("infoVendas");
const infoCaixa = document.getElementById("infoCaixa");
const infoReceita = document.getElementById("infoReceita");

const TAXA = 0.10; // Comissão da plataforma (10%)

// Indicadores em tempo real
onSnapshot(collection(db, "usuarios"), (snap) => {
  const vendedores = snap.docs.filter(d => d.data().tipo === "vendedor");
  const ativos = vendedores.filter(d => d.data().status);
  const perc = (ativos.length / (vendedores.length || 1)) * 100;
  infoVendedores.textContent = `Ativos: ${ativos.length} / ${vendedores.length}`;
  barraVendedores.style.width = `${perc}%`;
});

onSnapshot(collection(db, "pedidos"), (snap) => {
  infoVendas.textContent = snap.size;
  let total = 0;
  snap.forEach(docSnap => {
    const p = docSnap.data();
    if (p.statusPagamento === "pago" || p.statusPedido === "concluido")
      total += parseFloat(p.totalPedido || 0);
  });
  infoCaixa.textContent = "R$ " + total.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  infoReceita.textContent = "R$ " + (total * TAXA).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
});

// ==================== LISTA DE VENDEDORES ====================
const listaVendedores = document.getElementById("listaVendedores");
onSnapshot(collection(db, "usuarios"), (snapshot) => {
  listaVendedores.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const v = docSnap.data();
    if (v.tipo === "vendedor") {
      const card = document.createElement("div");
      card.className = "vendedor-card";
      card.innerHTML = `
        <img src="${v.foto || 'https://via.placeholder.com/230x140'}" alt="foto">
        <h3>${v.nome}</h3>
        <p>${v.produtos?.gas?.marca || "Marca não informada"} — R$ ${v.produtos?.gas?.preco || "--"}</p>
        <p>${v.status ? "🟢 Ativo" : "🔴 Inativo"}</p>
        <button class="btn-excluir">Excluir</button>
      `;
      card.querySelector(".btn-excluir").addEventListener("click", async () => {
        if (confirm(`Excluir vendedor ${v.nome}?`))
          await deleteDoc(doc(db, "usuarios", docSnap.id));
      });
      listaVendedores.appendChild(card);
    }
  });
});

// ==================== MODAL DE CADASTRO ====================
const modal = document.getElementById("modalCadastro");
const btnAbrir = document.getElementById("abrirCadastro");
const btnFechar = document.getElementById("fecharModal");

btnAbrir.addEventListener("click", () => modal.style.display = "flex");
btnFechar.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// Cadastro de novo vendedor
const nomeInput = document.getElementById("nome");
const senhaInput = document.getElementById("senha");
const marcaGasInput = document.getElementById("marcaGas");
const precoGasInput = document.getElementById("precoGas");
const fotoInput = document.getElementById("foto");
const btnCadastrar = document.getElementById("btnCadastrar");

btnCadastrar.addEventListener("click", async () => {
  const nome = nomeInput.value.trim();
  const senha = senhaInput.value.trim();
  if (!nome || !senha) {
    alert("Preencha ao menos nome e senha!");
    return;
  }

  const marcaGas = marcaGasInput.value.trim();
  const precoGas = precoGasInput.value.trim();
  const file = fotoInput.files[0];

  let fotoBase64 = "";
  if (file) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      fotoBase64 = reader.result;
      await salvarVendedor(fotoBase64, marcaGas, precoGas);
    };
    reader.readAsDataURL(file);
  } else {
    await salvarVendedor("", marcaGas, precoGas);
  }
});

async function salvarVendedor(foto, marcaGas, precoGas) {
  const vendedor = {
    nome: nomeInput.value.trim(),
    senha: senhaInput.value.trim(),
    tipo: "vendedor",
    status: true,
    foto,
    produtos: {
      gas: { ativo: !!(marcaGas || precoGas), marca: marcaGas, preco: precoGas },
      agua: { ativo: false, marca: "", preco: "" }
    }
  };
  await addDoc(collection(db, "usuarios"), vendedor);
  alert("✅ Vendedor cadastrado com sucesso!");
  nomeInput.value = senhaInput.value = marcaGasInput.value = precoGasInput.value = "";
  fotoInput.value = "";
  modal.style.display = "none";
}
