// admin.js — PaperTrail Admin Panel

const ADMIN_API = "http://localhost:4000/api/admin";

// ── Auth guard ──
(function () {
  const user = API.currentUser();
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
  }
  const info = document.getElementById("adminUserInfo");
  if (info) info.textContent = user.name + " (Admin)";
})();

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("pt_token"),
  };
}

async function adminFetch(path, opts = {}) {
  opts.headers = authHeaders();
  const res = await fetch(ADMIN_API + path, opts);
  return res.json();
}

function showToast(msg, color = "#2ecc40") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = color;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

function doLogout() {
  API.logout();
  window.location.href = "login.html";
}

function toggleSidebar() {
  document.getElementById("adminSidebar").classList.toggle("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

// ── Tab switching ──
function switchTab(name, el) {
  document
    .querySelectorAll(".admin-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".sidebar-link")
    .forEach((l) => l.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  el.classList.add("active");
  document.getElementById("adminPageTitle").textContent = el.textContent.trim();
  loadTab(name);
}

function loadTab(name) {
  if (name === "dashboard") loadDashboard();
  else if (name === "users") loadUsers();
  else if (name === "orders") loadOrders();
  else if (name === "books") loadBooks();
  else if (name === "marketplace") loadMarketplace();
  else if (name === "messages") loadMessages();
  else if (name === "memberships") loadMemberships();
}

// ── Search filter ──
function filterTable(tbodyId, query, cols) {
  const q = query.toLowerCase();
  const rows = document.querySelectorAll("#" + tbodyId + " tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const match = cols.some(
      (i) => cells[i] && cells[i].textContent.toLowerCase().includes(q),
    );
    row.style.display = !q || match ? "" : "none";
  });
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function badge(text, cls) {
  return `<span class="badge badge-${cls}">${text}</span>`;
}

// ── Dashboard ──
async function loadDashboard() {
  const r = await adminFetch("/stats");
  if (!r.success) return;
  document.getElementById("statUsers").textContent = r.data.users;
  document.getElementById("statOrders").textContent = r.data.orders;
  document.getElementById("statBooks").textContent = r.data.books;
  document.getElementById("statListings").textContent = r.data.listings;
  document.getElementById("statPaid").textContent = r.data.paid;

  // Recent orders (reuse orders endpoint, take first 5)
  const ro = await adminFetch("/orders");
  const tbody = document.getElementById("recentOrdersBody");
  if (!ro.success || !ro.data.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="loading-row">No orders yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = ro.data
    .slice(0, 5)
    .map(
      (o) => `
    <tr>
      <td>#${o.id}</td>
      <td>${o.name}</td>
      <td>$${parseFloat(o.total).toFixed(2)}</td>
      <td>${badge(o.status, o.status)}</td>
      <td>${fmt(o.created_at)}</td>
    </tr>`,
    )
    .join("");
}

// ── Users ──
async function loadUsers() {
  const r = await adminFetch("/users");
  const tbody = document.getElementById("usersBody");
  if (!r.success || !r.data.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading-row">No users found.</td></tr>`;
    return;
  }
  tbody.innerHTML = r.data
    .map(
      (u) => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${badge(u.plan, u.plan)}</td>
      <td>${badge(u.role, u.role)}</td>
      <td>${fmt(u.created_at)}</td>
      <td>
        <button class="btn-sm btn-promote" onclick="toggleRole(${u.id},'${u.role}')">
          ${u.role === "admin" ? "Demote" : "Make Admin"}
        </button>
        <button class="btn-sm btn-delete" onclick="deleteUser(${u.id})">Delete</button>
      </td>
    </tr>`,
    )
    .join("");
}

async function toggleRole(id, current) {
  const newRole = current === "admin" ? "user" : "admin";
  if (!confirm(`Change role to "${newRole}"?`)) return;
  const r = await adminFetch(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role: newRole }),
  });
  if (r.success) {
    showToast("Role updated");
    loadUsers();
  } else showToast(r.message, "#e74c3c");
}

async function deleteUser(id) {
  if (!confirm("Delete this user? This cannot be undone.")) return;
  const r = await adminFetch(`/users/${id}`, { method: "DELETE" });
  if (r.success) {
    showToast("User deleted");
    loadUsers();
  } else showToast(r.message, "#e74c3c");
}

// ── Orders ──
async function loadOrders() {
  const r = await adminFetch("/orders");
  const tbody = document.getElementById("ordersBody");
  if (!r.success || !r.data.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading-row">No orders yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = r.data
    .map(
      (o) => `
    <tr>
      <td>#${o.id}</td>
      <td>${o.name}</td>
      <td>${o.email}</td>
      <td>$${parseFloat(o.total).toFixed(2)}</td>
      <td>${o.delivery_type}</td>
      <td>
        <select class="btn-sm" onchange="updateOrderStatus(${o.id}, this.value)" style="padding:0.3em 0.5em;border:1px solid #d0e0f0;border-radius:6px;background:#fff;">
          ${["pending", "confirmed", "shipped", "delivered"]
            .map(
              (s) =>
                `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`,
            )
            .join("")}
        </select>
      </td>
      <td>${fmt(o.created_at)}</td>
      <td><button class="btn-sm btn-view" onclick="viewOrder(${o.id})">View</button></td>
    </tr>`,
    )
    .join("");
}

async function updateOrderStatus(id, status) {
  const r = await adminFetch(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (r.success) showToast("Status updated to " + status);
  else showToast(r.message, "#e74c3c");
}

async function viewOrder(id) {
  const r = await API.getOrder(id);
  if (!r.success) return showToast("Could not load order", "#e74c3c");
  const o = r.data;
  document.getElementById("orderModalContent").innerHTML = `
    <p><strong>Order #${o.id}</strong> — ${fmt(o.created_at)}</p>
    <p style="margin:.5em 0;"><strong>Customer:</strong> ${o.name} | ${o.email} | ${o.phone}</p>
    <p style="margin:.5em 0;"><strong>Address:</strong> ${o.address}, ${o.city} ${o.zip}</p>
    <p style="margin:.5em 0;"><strong>Delivery:</strong> ${o.delivery_type} ($${parseFloat(o.delivery_cost).toFixed(2)})</p>
    <hr style="margin:1em 0;border-color:#eee;" />
    <table class="admin-table">
      <thead><tr><th>Title</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
      <tbody>${(o.items || [])
        .map(
          (i) => `
        <tr>
          <td>${i.title}</td>
          <td>$${parseFloat(i.price).toFixed(2)}</td>
          <td>${i.qty}</td>
          <td>$${(i.price * i.qty).toFixed(2)}</td>
        </tr>`,
        )
        .join("")}
      </tbody>
    </table>
    <p style="margin-top:1em;font-weight:700;color:#0074d9;font-size:1.1em;">Total: $${parseFloat(o.total).toFixed(2)}</p>
  `;
  document.getElementById("orderModal").classList.add("active");
}

// ── Books ──
async function loadBooks() {
  const r = await adminFetch("/books");
  const tbody = document.getElementById("booksBody");
  if (!r.success || !r.data.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading-row">No books found.</td></tr>`;
    return;
  }
  tbody.innerHTML = r.data
    .map(
      (b) => `
    <tr>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.genre}</td>
      <td>$${parseFloat(b.price).toFixed(2)}</td>
      <td>${b.stock}</td>
      <td>${fmt(b.created_at)}</td>
    </tr>`,
    )
    .join("");
}

// ── Marketplace ──
async function loadMarketplace() {
  const r = await adminFetch("/marketplace");
  const tbody = document.getElementById("mpBody");
  if (!r.success || !r.data.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading-row">No listings found.</td></tr>`;
    return;
  }
  tbody.innerHTML = r.data
    .map(
      (l) => `
    <tr>
      <td>${l.title}</td>
      <td>${l.author}</td>
      <td>${badge(l.type, l.type)}</td>
      <td>${l.condition}</td>
      <td>$${parseFloat(l.price).toFixed(2)}</td>
      <td>${l.seller_name}</td>
      <td>${badge(l.active ? "active" : "inactive", l.active ? "active" : "inactive")}</td>
      <td><button class="btn-sm btn-delete" onclick="deleteListing(${l.id})">Delete</button></td>
    </tr>`,
    )
    .join("");
}

async function deleteListing(id) {
  if (!confirm("Permanently delete this listing?")) return;
  const r = await adminFetch(`/marketplace/${id}`, { method: "DELETE" });
  if (r.success) {
    showToast("Listing deleted");
    loadMarketplace();
  } else showToast(r.message, "#e74c3c");
}

// ── Messages ──
async function loadMessages() {
  const r = await adminFetch("/messages");
  const tbody = document.getElementById("messagesBody");
  if (!r.success || !r.data.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="loading-row">No messages yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = r.data
    .map(
      (m) => `
    <tr>
      <td>${m.sender_name}</td>
      <td>${m.sender_email}</td>
      <td>${m.listing_title || "#" + m.listing_id}</td>
      <td style="max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.message}</td>
      <td>${fmt(m.created_at)}</td>
    </tr>`,
    )
    .join("");
}

// ── Memberships ──
async function loadMemberships() {
  const r = await adminFetch("/memberships");
  const tbody = document.getElementById("membershipsBody");
  if (!r.success || !r.data.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="loading-row">No memberships yet.</td></tr>`;
    document.getElementById("mStatFree").textContent = 0;
    document.getElementById("mStatPremium").textContent = 0;
    document.getElementById("mStatUltimate").textContent = 0;
    return;
  }
  const counts = { free: 0, premium: 0, ultimate: 0 };
  r.data.forEach((m) => {
    if (counts[m.plan] !== undefined) counts[m.plan]++;
  });
  document.getElementById("mStatFree").textContent = counts.free;
  document.getElementById("mStatPremium").textContent = counts.premium;
  document.getElementById("mStatUltimate").textContent = counts.ultimate;

  tbody.innerHTML = r.data
    .map(
      (m) => `
    <tr>
      <td>${m.name}</td>
      <td>${m.email}</td>
      <td>${badge(m.plan, m.plan)}</td>
      <td>${m.price == 0 ? "Free" : "$" + parseFloat(m.price).toFixed(2) + "/mo"}</td>
      <td>${fmt(m.started_at)}</td>
    </tr>`,
    )
    .join("");
}

// ── Init ──
loadDashboard();
