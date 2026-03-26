import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ── FIREBASE CONFIG ──
const firebaseConfig = {
  apiKey: "AIzaSyB1_NkdX1x-6rpQQV_s_xzHMu2kkaQek9c",
  authDomain: "virtual-catholics-f7e07.firebaseapp.com",
  projectId: "virtual-catholics-f7e07",
  storageBucket: "virtual-catholics-f7e07.firebasestorage.app",
  messagingSenderId: "739147694611",
  appId: "1:739147694611:web:b781a5686901642cbc35e6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ── VERIFY COM FLASK ──
async function verifyWithFlask(user) {
  const idToken = await user.getIdToken();
  const res = await fetch("/verify-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  const data = await res.json();
  if (data.success) window.location.href = data.redirect;
  else throw new Error(data.error);
}

// ── AUTH FUNCTIONS ──
window.handleLogin = async function () {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value;
  if (!email || !pass) return showToast("Preencha todos os campos.", true);
  try {
    showToast("Entrando...");
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await verifyWithFlask(cred.user);
  } catch (e) { showToast(traduzirErro(e.code), true); }
};

window.handleRegister = async function () {
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pass = document.getElementById("reg-pass").value;
  const pass2 = document.getElementById("reg-pass2").value;
  if (!username || !email || !pass || !pass2) return showToast("Preencha todos os campos.", true);
  if (pass !== pass2) return showToast("As senhas não coincidem.", true);
  if (pass.length < 8) return showToast("Senha deve ter no mínimo 8 caracteres.", true);
  try {
    showToast("Criando conta...");
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: username });
    await verifyWithFlask(cred.user);
  } catch (e) { showToast(traduzirErro(e.code), true); }
};

window.handleGoogle = async function () {
  try {
    showToast("Abrindo Google...");
    const result = await signInWithPopup(auth, googleProvider);
    await verifyWithFlask(result.user);
  } catch (e) { showToast(traduzirErro(e.code), true); }
};

window.handleReset = async function () {
  const email = document.getElementById("reset-email").value.trim();
  if (!email) return showToast("Informe seu e-mail.", true);
  try {
    showToast("Enviando...");
    await sendPasswordResetEmail(auth, email);
    document.getElementById("form-state").style.display = "none";
    document.getElementById("success-state").style.display = "block";
  } catch (e) {
    showToast(e.code === "auth/user-not-found" ? "E-mail não encontrado." : "Erro ao enviar.", true);
  }
};

// ── UTILS ──
window.togglePass = function (id, el) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
  el.textContent = input.type === "password" ? "👁" : "🙈";
};

window.switchTab = function (tab) {
  document.querySelectorAll(".auth-tab").forEach((t, i) => {
    t.classList.toggle("active", (tab === "login" && i === 0) || (tab === "register" && i === 1));
  });
  document.getElementById("panel-login").classList.toggle("active", tab === "login");
  document.getElementById("panel-register").classList.toggle("active", tab === "register");
};

let toastTimer;
function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = isError ? "error show" : "show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.className = "", 3500);
}

function traduzirErro(code) {
  const erros = {
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "Senha muito fraca.",
    "auth/popup-closed-by-user": "Login cancelado.",
    "auth/network-request-failed": "Erro de conexão.",
  };
  return erros[code] || "Erro inesperado. Tente novamente.";
}

// ── PARTÍCULAS ──
const canvas = document.getElementById("particles-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener("resize", resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = -(Math.random() * 0.5 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 200 + 150;
    }
    update() {
      this.x += this.speedX; this.y += this.speedY; this.life++;
      this.currentOpacity = this.opacity * Math.sin((this.life / this.maxLife) * Math.PI);
      if (this.life >= this.maxLife) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentOpacity;
      ctx.fillStyle = "#c9a84c";
      ctx.shadowBlur = 4;
      ctx.shadowColor = "#c9a84c";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 60; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height;
    p.life = Math.floor(Math.random() * p.maxLife);
    particles.push(p);
  }

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  })();
}
