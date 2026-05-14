/**
 * api.js — Shared frontend API helper
 * Include this in index.html and marketplace.html before their own scripts.
 * Usage: const books = await API.get('/books');
 */

const API_BASE = "http://localhost:4000/api";

const API = {
  // Generic fetch wrapper
  async request(method, path, body = null) {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    const token = localStorage.getItem("pt_token");
    if (token) opts.headers["Authorization"] = "Bearer " + token;
    if (body)  opts.body = JSON.stringify(body);

    try {
      const res  = await fetch(API_BASE + path, opts);
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("API error:", err);
      return { success: false, message: "Network error — is the server running?" };
    }
  },

  get(path)         { return this.request("GET",    path); },
  post(path, body)  { return this.request("POST",   path, body); },
  del(path)         { return this.request("DELETE", path); },

  // ── Auth ──
  async register(name, email, password) {
    const r = await this.post("/auth/register", { name, email, password });
    if (r.success) { localStorage.setItem("pt_token", r.data.token); localStorage.setItem("pt_user", JSON.stringify(r.data.user)); }
    return r;
  },
  async login(email, password) {
    const r = await this.post("/auth/login", { email, password });
    if (r.success) { localStorage.setItem("pt_token", r.data.token); localStorage.setItem("pt_user", JSON.stringify(r.data.user)); }
    return r;
  },
  logout() {
    localStorage.removeItem("pt_token");
    localStorage.removeItem("pt_user");
  },
  currentUser() {
    const u = localStorage.getItem("pt_user");
    return u ? JSON.parse(u) : null;
  },

  // ── Books ──
  getBooks(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get("/books" + (q ? "?" + q : ""));
  },
  getBook(id) { return this.get("/books/" + id); },

  // ── Orders ──
  placeOrder(items, delivery, shipping) {
    return this.post("/orders", { items, delivery, shipping });
  },
  getOrder(id) { return this.get("/orders/" + id); },

  // ── Marketplace ──
  getListings(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get("/marketplace" + (q ? "?" + q : ""));
  },
  createListing(data)  { return this.post("/marketplace", data); },
  deleteListing(id)    { return this.del("/marketplace/" + id); },
  contactSeller(id, data) { return this.post("/marketplace/" + id + "/contact", data); },

  // ── Membership ──
  subscribe(plan)      { return this.post("/membership", { plan }); },
  getMembership(userId){ return this.get("/membership/" + userId); },
};
