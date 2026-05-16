// auth.js — Login & Register logic

function showToast(msg, color = "#2ecc40") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = color;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = "block";
}

function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁";
  }
}

// ── Login ──
async function doLogin() {
  hideError("loginError");
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const btn      = document.getElementById("loginBtn");

  if (!email || !password) return showError("loginError", "Please fill in all fields.");

  btn.disabled = true;
  btn.textContent = "Signing in…";

  const res = await API.login(email, password);

  btn.disabled = false;
  btn.textContent = "Sign In";

  if (!res.success) {
    return showError("loginError", res.message || "Login failed. Check your credentials.");
  }

  showToast("Welcome back, " + res.data.user.name + "!");
  setTimeout(() => {
    // Redirect admins to admin panel, others to home
    if (res.data.user.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
  }, 800);
}

// ── Register ──
async function doRegister() {
  hideError("regError");
  const name     = document.getElementById("regName").value.trim();
  const email    = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm  = document.getElementById("regConfirm").value;
  const btn      = document.getElementById("regBtn");

  if (!name || !email || !password || !confirm)
    return showError("regError", "Please fill in all fields.");
  if (password.length < 6)
    return showError("regError", "Password must be at least 6 characters.");
  if (password !== confirm)
    return showError("regError", "Passwords do not match.");

  btn.disabled = true;
  btn.textContent = "Creating account…";

  const res = await API.register(name, email, password);

  btn.disabled = false;
  btn.textContent = "Create Account";

  if (!res.success) {
    return showError("regError", res.message || "Registration failed. Try again.");
  }

  showToast("Account created! Welcome, " + res.data.user.name + "!");
  setTimeout(() => { window.location.href = "index.html"; }, 800);
}

// Redirect already-logged-in users away from auth pages
(function () {
  const user = API.currentUser();
  if (user) {
    const page = window.location.pathname;
    if (page.includes("login") || page.includes("register")) {
      window.location.href = "index.html";
    }
  }
})();
