// ── Load listings from API (falls back to local data if server is offline) ──
async function loadListings() {
  try {
    const res = await API.getListings();
    if (res.success && res.data.length > 0) {
      listings = res.data.map(function (l) {
        return {
          id: l.id, type: l.type, title: l.title, author: l.author,
          genre: l.genre, condition: l.condition, price: l.price,
          desc: l.description, seller: l.seller_name,
          time: formatTime(l.created_at), cover: l.cover_url
        };
      });
    }
  } catch (e) { /* server offline — use local seed data */ }
  filterListings();
}

function formatTime(iso) {
  if (!iso) return "recently";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return diff + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + " mins ago";
  if (diff < 86400)return Math.floor(diff / 3600) + " hrs ago";
  return Math.floor(diff / 86400) + " days ago";
}
// ── Local fallback data (used when server is offline) ──
var listings = [
  {
    id: 1, type: "sell", title: "The Great Gatsby", author: "F. Scott Fitzgerald",
    genre: "Classic", condition: "Like New", price: 8.99,
    desc: "Barely read, no markings. Paperback edition. Perfect condition.",
    seller: "BookLover92", time: "2 mins ago",
    cover: "https://covers.openlibrary.org/b/id/8231856-L.jpg"
  },
  {
    id: 2, type: "sell", title: "1984", author: "George Orwell",
    genre: "Fiction", condition: "Good", price: 6.50,
    desc: "Some highlighting in first chapter, otherwise clean. Great read.",
    seller: "ReadMore_BD", time: "15 mins ago",
    cover: "https://covers.openlibrary.org/b/id/8235110-L.jpg"
  },
  {
    id: 3, type: "buy", title: "To Kill a Mockingbird", author: "Harper Lee",
    genre: "Classic", condition: "Any", price: 10.00,
    desc: "Looking for any edition in good or better condition.",
    seller: "Nadia_Reads", time: "32 mins ago",
    cover: "https://covers.openlibrary.org/b/id/8091016-L.jpg"
  },
  {
    id: 4, type: "sell", title: "The Silent Patient", author: "Alex Michaelides",
    genre: "Thriller", condition: "New", price: 14.00,
    desc: "Bought as a gift but already had a copy. Sealed, never opened.",
    seller: "Arif_Books", time: "1 hr ago",
    cover: "https://covers.openlibrary.org/b/id/8281993-L.jpg"
  },
  {
    id: 5, type: "sell", title: "Project Hail Mary", author: "Andy Weir",
    genre: "Science Fiction", condition: "Like New", price: 12.00,
    desc: "Read once, spine is perfect. Highly recommend before selling!",
    seller: "SciFiSam", time: "2 hrs ago",
    cover: "https://covers.openlibrary.org/b/id/8255099-L.jpg"
  },
  {
    id: 6, type: "buy", title: "Pride and Prejudice", author: "Jane Austen",
    genre: "Romance", condition: "Good", price: 7.00,
    desc: "Need a copy for my book club. Any edition welcome.",
    seller: "Mitu_Dhaka", time: "3 hrs ago",
    cover: "https://covers.openlibrary.org/b/id/8228691-L.jpg"
  },
  {
    id: 7, type: "sell", title: "The Midnight Library", author: "Matt Haig",
    genre: "Fiction", condition: "Good", price: 9.00,
    desc: "A few dog-eared pages but text is clean. Wonderful book.",
    seller: "PageTurner99", time: "5 hrs ago",
    cover: "https://covers.openlibrary.org/b/id/8250634-L.jpg"
  },
  {
    id: 8, type: "sell", title: "Where The Crawdads Sing", author: "Delia Owens",
    genre: "Mystery", condition: "Like New", price: 11.50,
    desc: "Read once carefully. No marks, no damage. Comes with bookmark.",
    seller: "Riya_Reads", time: "6 hrs ago",
    cover: "https://covers.openlibrary.org/b/id/8250995-L.jpg"
  }
];

var currentTab = "all";

function showToast(msg, color) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = color || "#2ecc40";
  t.classList.add("show");
  setTimeout(function () { t.classList.remove("show"); }, 2400);
}

function setTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".mp-tab").forEach(function (b) { b.classList.remove("active"); });
  document.getElementById("tab" + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");
  filterListings();
}

function filterListings() {
  var search    = (document.getElementById("mpSearch").value || "").toLowerCase();
  var genre     = document.getElementById("filterGenre").value;
  var condition = document.getElementById("filterCondition").value;
  var maxPrice  = parseFloat(document.getElementById("filterPrice").value) || Infinity;
  var sort      = document.getElementById("filterSort").value;

  var filtered = listings.filter(function (l) {
    if (currentTab === "sell" && l.type !== "sell") return false;
    if (currentTab === "buy"  && l.type !== "buy")  return false;
    if (genre     && l.genre     !== genre)          return false;
    if (condition && l.condition !== condition && l.condition !== "Any") return false;
    if (l.price > maxPrice)                          return false;
    if (search && !l.title.toLowerCase().includes(search) &&
                  !l.author.toLowerCase().includes(search)) return false;
    return true;
  });

  if (sort === "price-asc")  filtered.sort(function (a, b) { return a.price - b.price; });
  if (sort === "price-desc") filtered.sort(function (a, b) { return b.price - a.price; });

  renderListings(filtered);
}

function renderListings(data) {
  var grid = document.getElementById("listingsGrid");
  var none = document.getElementById("noResults");

  if (data.length === 0) {
    grid.innerHTML = "";
    none.style.display = "block";
    return;
  }
  none.style.display = "none";

  grid.innerHTML = data.map(function (l) {
    var typeClass = l.type === "sell" ? "mp-type-sell" : "mp-type-buy";
    var typeLabel = l.type === "sell" ? "Want to Sell" : "Want to Buy";
    var btnLabel  = l.type === "sell" ? "Buy / Contact" : "Offer to Sell";

    return '<div class="mp-card">' +
      '<div class="mp-card-top">' +
        '<div class="mp-card-cover"><img src="' + l.cover + '" alt="' + l.title + '" onerror="this.parentElement.textContent=\'📚\'" /></div>' +
        '<div class="mp-card-info">' +
          '<span class="mp-card-type ' + typeClass + '">' + typeLabel + '</span>' +
          '<div class="mp-card-title">' + l.title + '</div>' +
          '<div class="mp-card-author">by ' + l.author + '</div>' +
          '<div class="mp-card-meta">' +
            '<span class="mp-badge">' + l.genre + '</span>' +
            '<span class="mp-badge">' + l.condition + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      (l.desc ? '<p class="mp-card-desc">' + l.desc + '</p>' : '') +
      '<div class="mp-card-footer">' +
        '<div>' +
          '<div class="mp-card-price">$' + l.price.toFixed(2) + '</div>' +
          '<div class="mp-card-seller">by <strong>' + l.seller + '</strong> · ' + l.time + '</div>' +
        '</div>' +
        '<div class="mp-card-actions">' +
          '<button class="mp-btn-save" onclick="saveItem(' + l.id + ')" title="Save">♡</button>' +
          '<button class="mp-btn-contact" onclick="openContactModal(' + l.id + ')">' + btnLabel + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join("");
}

function saveItem(id) {
  var l = listings.find(function (x) { return x.id === id; });
  if (l) showToast('"' + l.title + '" saved to wishlist ♡', "#0074d9");
}

// ── List a Book Modal ──
function openListModal() {
  document.getElementById("listModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeListModal() {
  document.getElementById("listModal").classList.remove("active");
  document.body.style.overflow = "";
}

async function submitListing() {
  var title  = document.getElementById("lTitle").value.trim();
  var author = document.getElementById("lAuthor").value.trim();
  var price  = parseFloat(document.getElementById("lPrice").value);
  var seller = document.getElementById("lSeller").value.trim();

  if (!title || !author || !seller || isNaN(price) || price < 0) {
    showToast("Please fill in all required fields.", "#e74c3c");
    return;
  }

  var payload = {
    type:        document.getElementById("lType").value,
    title:       title,
    author:      author,
    genre:       document.getElementById("lGenre").value,
    condition:   document.getElementById("lCondition").value,
    price:       price,
    description: document.getElementById("lDesc").value.trim(),
    seller_name: seller
  };

  // Try API first
  try {
    var res = await API.createListing(payload);
    if (res.success) {
      var l = res.data;
      listings.unshift({ id: l.id, type: l.type, title: l.title, author: l.author,
        genre: l.genre, condition: l.condition, price: l.price,
        desc: l.description, seller: l.seller_name, time: "Just now", cover: l.cover_url || "" });
    } else {
      // Offline fallback
      listings.unshift({ id: Date.now(), ...payload, desc: payload.description,
        seller: payload.seller_name, time: "Just now", cover: "" });
    }
  } catch (e) {
    listings.unshift({ id: Date.now(), ...payload, desc: payload.description,
      seller: payload.seller_name, time: "Just now", cover: "" });
  }

  closeListModal();
  document.getElementById("listForm").reset();
  filterListings();
  showToast("Your listing is live! 🎉", "#0074d9");
}

// ── Contact Modal ──
function openContactModal(id) {
  window._contactListingId = id;
  var l = listings.find(function (x) { return x.id === id; });
  if (!l) return;
  document.getElementById("contactTitle").textContent =
    l.type === "sell" ? "Contact Seller" : "Make an Offer";
  document.getElementById("contactSub").textContent =
    '"' + l.title + '" by ' + l.author + ' — $' + l.price.toFixed(2);
  document.getElementById("contactModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeContactModal() {
  document.getElementById("contactModal").classList.remove("active");
  document.body.style.overflow = "";
}

async function sendContact() {
  var name  = document.getElementById("cName").value.trim();
  var email = document.getElementById("cEmail").value.trim();
  var msg   = document.getElementById("cMsg").value.trim();
  if (!name || !email || !msg) {
    showToast("Please fill in all fields.", "#e74c3c");
    return;
  }
  try {
    await API.contactSeller(window._contactListingId, {
      sender_name: name, sender_email: email, message: msg
    });
  } catch (e) { /* offline — still show success */ }
  closeContactModal();
  showToast("Message sent! The seller will reply to " + email, "#2ecc40");
}

// Close modals on overlay click
document.addEventListener("DOMContentLoaded", function () {
  loadListings();   // fetch from API, fallback to local data

  document.getElementById("listModal").addEventListener("click", function (e) {
    if (e.target === this) closeListModal();
  });
  document.getElementById("contactModal").addEventListener("click", function (e) {
    if (e.target === this) closeContactModal();
  });
});
