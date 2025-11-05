import { db } from "./firebase.js";
import {
  collection, addDoc, onSnapshot, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const nomeInput = document.getElementById("nome");
const senhaInput = document.getElementById("senha");
const marcaGasInput = document.getElementById("marcaGas");
const precoGasInput = document.getElementById("precoGas");
const fotoInput = document.getElementById("foto");
const btnCadastrar = document.getElementById("btnCadastrar");
const listaVendedores = document.getElementById("listaVendedores");

// Cadastrar novo vendedor
btnCadastrar.addEventListener("click", async () => {
  const nome = nomeInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!nome || !senha) {
    alert("Preencha ao menos nome e senha!");
    return;
  }

  let fotoBase64 = "";
  const file = fotoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = async () => {
      fotoBase64 = reader.result;
      await salvarVendedor(fotoBase64);
    };
    reader.readAsDataURL(file);
  } else {
    await salvarVendedor("");
  }
});

async function salvarVendedor(foto) {
  const marcaGas = marcaGasInput.value.trim();
  const precoGas = precoGasInput.value.trim();

  const vendedor = {
    nome: nomeInput.value.trim(),
    senha: senhaInput.value.trim(),
    tipo: "vendedor",
    status: false,
    foto: foto,
    produtos: {
      gas: { ativo: !!(marcaGas || precoGas), marca: marcaGas, preco: precoGas },
      agua: { ativo: false, marca: "", preco: "" }
    }
  };

  await addDoc(collection(db, "usuarios"), vendedor);

  alert("✅ Vendedor cadastrado com sucesso!");
  nomeInput.value = senhaInput.value = marcaGasInput.value = precoGasInput.value = "";
  fotoInput.value = "";
}

// Listar vendedores em tempo real
onSnapshot(collection(db, "usuarios"), (snapshot) => {
  listaVendedores.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const v = docSnap.data();
    if (v.tipo === "vendedor") {
      const card = document.createElement("div");
      card.className = "vendedor-card";
      card.innerHTML = `
        <img src="${v.foto || 'https://via.placeholder.com/230x140'}" class="foto-vendedor">
        <h3>${v.nome}</h3>
        <p>🔥 Gás: ${v.produtos?.gas?.marca || "—"} - R$ ${v.produtos?.gas?.preco || "—"}</p>
        <p>${v.status ? "🟢 Ativo" : "🔴 Inativo"}</p>
        <button class="btn-excluir">Excluir</button>
      `;

      card.querySelector(".btn-excluir").addEventListener("click", async () => {
        if (confirm(`Excluir vendedor ${v.nome}?`)) {
          await deleteDoc(doc(db, "usuarios", docSnap.id));
        }
      });

      listaVendedores.appendChild(card);
    }
  });
});
