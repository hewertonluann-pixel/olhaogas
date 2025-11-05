import { app, db, auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// ======== Alternância entre abas ========
const abaEntrar = document.getElementById("abaEntrar");
const abaInscrever = document.getElementById("abaInscrever");
const formEntrar = document.getElementById("formEntrar");
const formInscrever = document.getElementById("formInscrever");

abaEntrar.addEventListener("click", () => {
  abaEntrar.classList.add("ativa");
  abaInscrever.classList.remove("ativa");
  formEntrar.style.display = "block";
  formInscrever.style.display = "none";
});

abaInscrever.addEventListener("click", () => {
  abaInscrever.classList.add("ativa");
  abaEntrar.classList.remove("ativa");
  formInscrever.style.display = "block";
  formEntrar.style.display = "none";
});

// ======== Cadastro com e-mail/senha ========
document.getElementById("btnCadastrar").addEventListener("click", async () => {
  const nome = document.getElementById("cadNome").value.trim();
  const email = document.getElementById("cadEmail").value.trim();
  const senha = document.getElementById("cadSenha").value.trim();
  const rua = document.getElementById("cadRua").value.trim();
  const numero = document.getElementById("cadNumero").value.trim();
  const bairro = document.getElementById("cadBairro").value.trim();
  const cidade = document.getElementById("cadCidade").value.trim();
  const estado = document.getElementById("cadEstado").value.trim();
  const tipo = document.getElementById("cadTipo").value;

  if (!nome || !email || !senha || !rua || !numero || !bairro || !cidade || !estado) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = cred.user.uid;

    await setDoc(doc(db, "usuarios", uid), {
      id: uid,
      nome,
      email,
      tipo,
      endereco: { rua, numero, bairro, cidade, estado },
      status: false,
      produtos: {
        gas: { ativo: false, marca: "", preco: "" },
        agua: { ativo: false, marca: "", preco: "" }
      }
    });

    alert("✅ Cadastro realizado com sucesso!");
    abaEntrar.click();
  } catch (error) {
    alert("Erro ao cadastrar: " + error.message);
  }
});

// ======== Login com e-mail/senha ========
document.getElementById("btnEntrar").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();

  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    await redirecionarUsuario(cred.user.uid);
  } catch (error) {
    alert("Erro ao entrar: " + error.message);
  }
});

// ======== Login com Google ========
const provider = new GoogleAuthProvider();
document.getElementById("btnGoogle").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // Primeira vez — solicitar complemento
      const tipo = prompt("Você é 'cliente' ou 'vendedor'?") || "cliente";
      const cidade = prompt("Digite sua cidade:");
      const estado = prompt("Digite seu estado:");

      await setDoc(ref, {
        id: user.uid,
        nome: user.displayName || "Usuário",
        email: user.email,
        tipo,
        endereco: { rua: "", numero: "", bairro: "", cidade, estado },
        status: false,
        produtos: {
          gas: { ativo: false, marca: "", preco: "" },
          agua: { ativo: false, marca: "", preco: "" }
        },
        foto: user.photoURL || ""
      });
    }

    await redirecionarUsuario(user.uid);
  } catch (error) {
    alert("Erro no login com Google: " + error.message);
  }
});

// ======== Redirecionamento por tipo ========
async function redirecionarUsuario(uid) {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const dados = snap.data();
    localStorage.setItem("usuarioLogado", JSON.stringify(dados));

    if (dados.tipo === "vendedor") window.location.href = "vendedor.html";
    else if (dados.tipo === "gerente") window.location.href = "gerente.html";
    else window.location.href = "cliente.html";
  } else {
    alert("Usuário não encontrado no banco de dados!");
  }
}
