var books = {};
var fallbackBooks = {
  1: {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic Fiction",
    price: 14.99,
    img: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    desc: "Set in the Jazz Age on Long Island, this novel depicts narrator Nick Carraway's interactions with the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan. A timeless story of wealth, love, and the American Dream.",
  },
  2: {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Classic / Drama",
    price: 12.99,
    img: "https://covers.openlibrary.org/b/id/8091016-L.jpg",
    desc: "A gripping tale of racial injustice and childhood innocence set in the American South during the 1930s. Told through the eyes of young Scout Finch, whose father Atticus defends a Black man falsely accused of a crime.",
  },
  3: {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian Fiction",
    price: 11.49,
    img: "https://covers.openlibrary.org/b/id/8235110-L.jpg",
    desc: "A chilling dystopia where Big Brother watches your every move. Winston Smith works for the Party rewriting history, but secretly dreams of rebellion. One of the most influential novels of the 20th century.",
  },
  4: {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance / Classic",
    price: 9.99,
    img: "https://covers.openlibrary.org/b/id/8228691-L.jpg",
    desc: "The story follows Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage in the society of the landed gentry of early 19th-century England.",
  },
  5: {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Psychological Thriller",
    price: 16.99,
    img: "https://covers.openlibrary.org/b/id/8281993-L.jpg",
    desc: "Alicia Berenson shoots her husband five times and then never speaks another word. Theo Faber, a criminal psychotherapist, is obsessed with uncovering her motive. A shocking twist awaits at the end.",
  },
  6: {
    title: "Where The Crawdads Sing",
    author: "Delia Owens",
    genre: "Mystery / Drama",
    price: 13.49,
    img: "https://covers.openlibrary.org/b/id/8250995-L.jpg",
    desc: "Abandoned by her family, Kya Clark raises herself in the marshes of North Carolina. When a local man is found dead, she becomes the prime suspect. A beautiful story of nature, loneliness, and survival.",
  },
  7: {
    title: "The Guest List",
    author: "Lucy Foley",
    genre: "Mystery / Thriller",
    price: 15.99,
    img: "https://covers.openlibrary.org/b/id/8226193-L.jpg",
    desc: "On a remote island off the Irish coast, a wedding celebration turns deadly. Everyone has a secret. Everyone has a motive. A gripping whodunit told from multiple perspectives.",
  },
  8: {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fantasy / Fiction",
    price: 12.99,
    img: "https://covers.openlibrary.org/b/id/8250634-L.jpg",
    desc: "Between life and death there is a library. Nora Seed finds herself there and discovers books that let her live out all the lives she could have lived. A moving story about regret, hope, and second chances.",
  },
  9: {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    price: 17.99,
    img: "https://covers.openlibrary.org/b/id/8255099-L.jpg",
    desc: "Ryland Grace wakes up alone on a spaceship with no memory of how he got there. He soon realizes he is on a solo mission to save Earth from an extinction-level threat. A thrilling and heartwarming sci-fi adventure.",
  },
};

function normalizeBook(book) {
  return {
    id: book.id,
    title: book.title || book.name || "Untitled",
    author: book.author || "Unknown Author",
    genre: book.genre || "General",
    price: Number(book.price || book.cost || 0),
    img:
      book.cover_url ||
      book.img ||
      "https://via.placeholder.com/240x320?text=No+Cover",
    desc:
      book.description ||
      book.desc ||
      book.summary ||
      "No description available.",
  };
}

function formatPrice(amount) {
  return "$" + Number(amount || 0).toFixed(2);
}

function buildBookCard(book) {
  return (
    '<div class="swiper-slide card" data-id="' +
    book.id +
    '">' +
    '<img src="' +
    book.img +
    '" alt="' +
    book.title +
    '" />' +
    "<h3>" +
    book.title +
    "</h3>" +
    "<p>" +
    formatPrice(book.price) +
    "</p>" +
    '<div class="card-btns">' +
    '<button class="btn-cart" data-id="' +
    book.id +
    '">Add to Cart</button>' +
    '<button class="btn-buy" data-id="' +
    book.id +
    '">Buy Now</button>' +
    "</div>" +
    "</div>"
  );
}

function renderBookSection(selector, bookList) {
  var wrapper = document.querySelector(selector);
  if (!wrapper) return;
  wrapper.innerHTML = bookList.map(buildBookCard).join("");
}

function renderBooks(bookArray) {
  var normalizedBooks = bookArray.map(normalizeBook);
  books = {};
  normalizedBooks.forEach(function (book) {
    books[book.id] = book;
  });

  renderBookSection("#allBooks .swiper-wrapper", normalizedBooks);
  renderBookSection(
    "#newArrivals .swiper-wrapper",
    normalizedBooks.slice(0, 5),
  );
  renderBookSection(
    "#latestAdditions .swiper-wrapper",
    normalizedBooks.slice(5, 10),
  );
}

async function loadBooks() {
  try {
    var response = await API.getBooks();
    if (
      response.success &&
      Array.isArray(response.data) &&
      response.data.length
    ) {
      renderBooks(response.data);
      return;
    }
    console.warn("Book API returned no data, using fallback books.", response);
  } catch (err) {
    console.error("Error loading books:", err);
  }

  renderBooks(Object.values(fallbackBooks));
}

var DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard Delivery (5-7 days)", price: 3.99 },
  { id: "express", label: "Express Delivery (2-3 days)", price: 7.99 },
  { id: "overnight", label: "Overnight Delivery (Next day)", price: 14.99 },
  { id: "free", label: "Free Delivery (7-10 days)", price: 0.0 },
];

var cart = {};

function showToast(msg, color) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = color || "#2ecc40";
  t.classList.add("show");
  setTimeout(function () {
    t.classList.remove("show");
  }, 2400);
}

function updateCartCount() {
  var total = 0;
  Object.values(cart).forEach(function (i) {
    total += i.qty;
  });
  document.getElementById("cartCount").textContent = total;
}

function getSubtotal() {
  var sub = 0;
  Object.values(cart).forEach(function (i) {
    sub += i.price * i.qty;
  });
  return sub;
}

function getSelectedDelivery() {
  var sel = document.querySelector('input[name="cartDelivery"]:checked');
  if (!sel) return 3.99;
  var opt = DELIVERY_OPTIONS.find(function (o) {
    return o.id === sel.value;
  });
  return opt ? opt.price : 3.99;
}

function updateCartTotals() {
  var sub = getSubtotal();
  var delivery = getSelectedDelivery();
  var total = sub + delivery;
  document.getElementById("cartSubtotal").textContent = "$" + sub.toFixed(2);
  document.getElementById("cartDeliveryCharge").textContent =
    delivery === 0 ? "Free" : "$" + delivery.toFixed(2);
  document.getElementById("cartTotal").textContent = "$" + total.toFixed(2);
}

function renderCart() {
  var container = document.getElementById("cartItems");
  var items = Object.values(cart);
  var deliverySection = document.getElementById("cartDeliverySection");

  if (items.length === 0) {
    container.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    deliverySection.style.display = "none";
    updateCartTotals();
    return;
  }

  deliverySection.style.display = "block";
  var html = "";
  items.forEach(function (item) {
    html +=
      '<div class="cart-item">' +
      '<img src="' +
      item.img +
      '" alt="' +
      item.title +
      '" />' +
      '<div class="cart-item-info">' +
      "<h4>" +
      item.title +
      "</h4>" +
      "<p>$" +
      item.price.toFixed(2) +
      "</p>" +
      '<div class="cart-item-qty">' +
      '<button onclick="changeQty(' +
      item.id +
      ',-1)">-</button>' +
      "<span>" +
      item.qty +
      "</span>" +
      '<button onclick="changeQty(' +
      item.id +
      ',1)">+</button>' +
      "</div>" +
      "</div>" +
      '<button class="cart-item-remove" onclick="removeFromCart(' +
      item.id +
      ')" title="Remove">&#x2715;</button>' +
      "</div>";
  });
  container.innerHTML = html;
  updateCartTotals();
}

function addToCart(id) {
  var book = books[id];
  if (!book) return;
  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = {
      id: id,
      title: book.title,
      price: book.price,
      img: book.img,
      qty: 1,
    };
  }
  updateCartCount();
  renderCart();
  showToast('"' + book.title + '" added to cart!');
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartCount();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  updateCartCount();
  renderCart();
}

function openCart() {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartOverlay").classList.add("active");
  renderCart();
}

function closeCart() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("active");
}

function openModal(id) {
  var book = books[id];
  if (!book) return;
  document.getElementById("modalImg").src = book.img;
  document.getElementById("modalImg").alt = book.title;
  document.getElementById("modalTitle").textContent = book.title;
  document.getElementById("modalAuthor").textContent = "by " + book.author;
  document.getElementById("modalGenre").textContent = book.genre;
  document.getElementById("modalDesc").textContent = book.desc;
  document.getElementById("modalPrice").textContent =
    "$" + book.price.toFixed(2);
  document.getElementById("modalCartBtn").setAttribute("data-id", id);
  document.getElementById("modalBuyBtn").setAttribute("data-id", id);
  document.getElementById("productModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("productModal").classList.remove("active");
  document.body.style.overflow = "";
}

function buildDeliveryOptions() {
  var container = document.getElementById("cartDeliveryOptions");
  var html = "";
  DELIVERY_OPTIONS.forEach(function (opt, i) {
    html +=
      '<label class="cart-delivery-option">' +
      '<input type="radio" name="cartDelivery" value="' +
      opt.id +
      '"' +
      (i === 0 ? " checked" : "") +
      " />" +
      '<span class="cart-delivery-label">' +
      "<span>" +
      opt.label +
      "</span>" +
      '<span class="cart-delivery-price">' +
      (opt.price === 0 ? "Free" : "$" + opt.price.toFixed(2)) +
      "</span>" +
      "</span>" +
      "</label>";
  });
  container.innerHTML = html;
  container.addEventListener("change", updateCartTotals);
}

function openCheckout() {
  if (Object.keys(cart).length === 0) {
    showToast("Your cart is empty!", "#e74c3c");
    return;
  }
  renderCheckoutSummary();
  document.getElementById("checkoutModal").classList.add("active");
  document.body.style.overflow = "hidden";
  closeCart();
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.remove("active");
  document.body.style.overflow = "";
}

function renderCheckoutSummary() {
  var items = Object.values(cart);
  var sub = getSubtotal();
  var deliveryPrice = getSelectedDelivery();
  var total = sub + deliveryPrice;

  var html = "";
  items.forEach(function (item) {
    html +=
      '<div class="co-item">' +
      '<img src="' +
      item.img +
      '" alt="' +
      item.title +
      '" />' +
      '<div class="co-item-info"><span>' +
      item.title +
      "</span><span>x" +
      item.qty +
      "</span></div>" +
      '<span class="co-item-price">$' +
      (item.price * item.qty).toFixed(2) +
      "</span>" +
      "</div>";
  });
  document.getElementById("coItems").innerHTML = html;
  document.getElementById("coSubtotal").textContent = "$" + sub.toFixed(2);
  document.getElementById("coDelivery").textContent =
    deliveryPrice === 0 ? "Free" : "$" + deliveryPrice.toFixed(2);
  document.getElementById("coTotal").textContent = "$" + total.toFixed(2);
}

function validateCheckoutForm() {
  var name = document.getElementById("coName").value.trim();
  var email = document.getElementById("coEmail").value.trim();
  var phone = document.getElementById("coPhone").value.trim();
  var address = document.getElementById("coAddress").value.trim();
  var city = document.getElementById("coCity").value.trim();
  var zip = document.getElementById("coZip").value.trim();
  if (!name || !email || !phone || !address || !city || !zip) {
    showToast("Please fill in all required fields.", "#e74c3c");
    return false;
  }
  var emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailReg.test(email)) {
    showToast("Please enter a valid email address.", "#e74c3c");
    return false;
  }
  return true;
}

async function placeOrder() {
  if (!validateCheckoutForm()) return;
  var name = document.getElementById("coName").value.trim();

  // Build payload for API
  var items = Object.values(cart).map(function (i) {
    return { bookId: i.id, title: i.title, price: i.price, qty: i.qty };
  });
  var deliveryPrice = getSelectedDelivery();
  var sel = document.querySelector('input[name="cartDelivery"]:checked');
  var delivery = { type: sel ? sel.value : "standard", cost: deliveryPrice };
  var shipping = {
    name: name,
    email: document.getElementById("coEmail").value.trim(),
    phone: document.getElementById("coPhone").value.trim(),
    address: document.getElementById("coAddress").value.trim(),
    city: document.getElementById("coCity").value.trim(),
    zip: document.getElementById("coZip").value.trim(),
  };

  // Try API — works silently offline too
  try {
    await API.placeOrder(items, delivery, shipping);
  } catch (e) {}

  closeCheckout();
  cart = {};
  updateCartCount();
  renderCart();
  document.getElementById("orderSuccessName").textContent = name;
  document.getElementById("orderSuccessModal").classList.add("active");
  document.body.style.overflow = "hidden";
  document.getElementById("checkoutForm").reset();
}

function closeOrderSuccess() {
  document.getElementById("orderSuccessModal").classList.remove("active");
  document.body.style.overflow = "";
}

function selectPlan(plan) {
  var names = { free: "Basic", premium: "Premium", vip: "Ultimate" };
  document.getElementById("membershipModal").classList.remove("active");
  document.body.style.overflow = "";
  showToast("You selected the " + names[plan] + " plan! 🎉", "#0074d9");
}

function handleSearch() {
  var query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) return;
  var found = Object.entries(books).find(function (entry) {
    var b = entry[1];
    return (
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query)
    );
  });
  if (found) {
    openModal(parseInt(found[0]));
  } else {
    showToast('No books found for "' + query + '"', "#e74c3c");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  buildDeliveryOptions();

  document.getElementById("cartBtn").addEventListener("click", function (e) {
    e.preventDefault();
    openCart();
  });
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
  document
    .getElementById("checkoutBtn")
    .addEventListener("click", openCheckout);

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document
    .getElementById("productModal")
    .addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });
  document
    .getElementById("modalCartBtn")
    .addEventListener("click", function () {
      var id = parseInt(this.getAttribute("data-id"));
      if (id && books[id]) addToCart(id);
    });
  document.getElementById("modalBuyBtn").addEventListener("click", function () {
    var id = parseInt(this.getAttribute("data-id"));
    if (id && books[id]) {
      addToCart(id);
      closeModal();
      openCart();
    }
  });

  document
    .getElementById("checkoutModalClose")
    .addEventListener("click", closeCheckout);
  document
    .getElementById("checkoutModal")
    .addEventListener("click", function (e) {
      if (e.target === this) closeCheckout();
    });
  document
    .getElementById("placeOrderBtn")
    .addEventListener("click", placeOrder);

  document
    .getElementById("orderSuccessClose")
    .addEventListener("click", closeOrderSuccess);
  document
    .getElementById("continueShopping")
    .addEventListener("click", closeOrderSuccess);

  // Membership modal
  document
    .querySelector(".membership button")
    .addEventListener("click", function () {
      document.getElementById("membershipModal").classList.add("active");
      document.body.style.overflow = "hidden";
    });
  document
    .getElementById("membershipModalClose")
    .addEventListener("click", function () {
      document.getElementById("membershipModal").classList.remove("active");
      document.body.style.overflow = "";
    });
  document
    .getElementById("membershipModal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("active");
        document.body.style.overflow = "";
      }
    });

  document.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("btn-cart") &&
      !e.target.closest(".modal-box")
    ) {
      e.stopPropagation();
      var id = parseInt(e.target.getAttribute("data-id"));
      if (id) addToCart(id);
      return;
    }
    if (
      e.target.classList.contains("btn-buy") &&
      !e.target.closest(".modal-box")
    ) {
      e.stopPropagation();
      var id = parseInt(e.target.getAttribute("data-id"));
      if (id) {
        addToCart(id);
        openCart();
      }
      return;
    }
    if (e.target.closest(".card-btns")) return;
    var card = e.target.closest(".swiper-slide.card[data-id]");
    if (card) {
      var id = parseInt(card.getAttribute("data-id"));
      if (id) openModal(id);
    }
  });

  window.addEventListener("scroll", function () {
    document
      .getElementById("navbar")
      .classList.toggle("sticky", window.scrollY > 66);
  });

  // Hamburger nav toggle
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  navToggle.addEventListener("click", function () {
    navMenu.classList.toggle("open");
    navToggle.classList.toggle("active");
  });
  // Close menu when a nav link is clicked
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      navToggle.classList.remove("active");
    });
  });

  new Swiper(".book-slider", {
    slidesPerView: 1,
    loop: true,
    effect: "fade",
    fadeEffect: { crossFade: true },
    speed: 1200,
    autoplay: { delay: 4500, disableOnInteraction: false },
    pagination: { el: ".book-slider .swiper-pagination", clickable: true },
    navigation: { nextEl: ".hero-next", prevEl: ".hero-prev" },
  });

  await loadBooks();

  new Swiper(".book-card-slider", {
    slidesPerView: 1,
    spaceBetween: 24,
    centeredSlides: false,
    grabCursor: true,
    loop: true,
    speed: 600,
    pagination: { el: ".book-card-slider .swiper-pagination", clickable: true, dynamicBullets: true },
    navigation: { nextEl: ".book-next", prevEl: ".book-prev" },
    breakpoints: {
      480: { slidesPerView: 2, spaceBetween: 16 },
      768: { slidesPerView: 3, spaceBetween: 20 },
      1024: { slidesPerView: 4, spaceBetween: 24 },
    },
  });
  new Swiper(".new-arrivals-slider", {
    slidesPerView: 1,
    spaceBetween: 24,
    grabCursor: true,
    loop: true,
    speed: 600,
    pagination: { el: ".new-arrivals-slider .swiper-pagination", clickable: true, dynamicBullets: true },
    navigation: { nextEl: ".arrivals-next", prevEl: ".arrivals-prev" },
    breakpoints: {
      480: { slidesPerView: 2, spaceBetween: 16 },
      768: { slidesPerView: 3, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
    },
  });
  new Swiper(".latest-additions-slider", {
    slidesPerView: 1,
    spaceBetween: 24,
    grabCursor: true,
    loop: true,
    speed: 600,
    pagination: { el: ".latest-additions-slider .swiper-pagination", clickable: true, dynamicBullets: true },
    navigation: { nextEl: ".latest-next", prevEl: ".latest-prev" },
    breakpoints: {
      480: { slidesPerView: 2, spaceBetween: 16 },
      768: { slidesPerView: 3, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 24 },
    },
  });
});
