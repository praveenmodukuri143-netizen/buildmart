// ================= FIREBASE =================

const firebaseConfig = {
  apiKey: "AIzaSyDErFysC_Z7dP96Gn29cblxcgsmzIneobA",
  authDomain: "buildmart-f394b.firebaseapp.com",
  projectId: "buildmart-f394b",
  storageBucket: "buildmart-f394b.firebasestorage.app",
  messagingSenderId: "255269056106",
  appId: "1:255269056106:web:60ba9cf4696ea2717ce413",
  measurementId: "G-JVRDZ49BC0"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();


// ================= SETTINGS =================

const UPI_ID = "9000158191@ibl";
const STORE_NAME = "Srinivasa Building Materials";

let products = [];
let cart = [];
let deliverySlabs = [];
let freeDeliveryAbove = 0;


// ================= LOAD CART =================

try {
  cart = JSON.parse(localStorage.getItem("buildmartCart")) || [];
} catch {
  cart = [];
}


// ================= DOM =================

const productsContainer =
  document.getElementById("productsContainer");

const cartLink =
  document.getElementById("cartLink");

const cartModal =
  document.getElementById("cartModal");

const checkoutModal =
  document.getElementById("checkoutModal");

const successModal =
  document.getElementById("successModal");


// ================= PRODUCTS =================

function loadProducts() {

  if (!productsContainer) return;

  productsContainer.innerHTML = `
    <div class="product-card">
      <div class="product-image">⏳</div>
      <h3>Loading products...</h3>
      <p>Please wait.</p>
    </div>
  `;

  db.collection("products")
    .onSnapshot(
      snapshot => {

        products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        products.sort((a, b) =>
          String(a.name || "")
            .localeCompare(String(b.name || ""))
        );

        renderProducts();

        updateCartAfterProductsLoad();
      },

      error => {

        console.error("Products error:", error);

        productsContainer.innerHTML = `
          <div class="product-card">
            <div class="product-image">⚠️</div>
            <h3>Products could not load</h3>
            <p>Please refresh the page.</p>
          </div>
        `;
      }
    );
}


// ================= RENDER PRODUCTS =================

function renderProducts() {

  if (!productsContainer) return;

  const availableProducts =
    products.filter(p => p.available !== false);

  if (!availableProducts.length) {

    productsContainer.innerHTML = `
      <div class="product-card">
        <div class="product-image">📦</div>
        <h3>No products available</h3>
        <p>Please check again later.</p>
      </div>
    `;

    return;
  }

  productsContainer.innerHTML =
    availableProducts.map(product => {

      const price = Number(product.price || 0);
      const unit = product.unit || "";
      const stock = Number(product.stock || 0);
      const minOrder = Math.max(
        1,
        Number(product.minOrder || 1)
      );

      const materialVisual = getMaterialVisual(product.name);

      return `
        <div class="product-card">

          <div class="product-image">
            ${materialVisual}
          </div>

          <h3>
            ${escapeHtml(product.name || "Material")}
          </h3>

          <p>
            ${escapeHtml(product.description || "")}
          </p>

          <p>
            <strong>
              ₹${price.toLocaleString("en-IN")}
            </strong>
            ${unit ? " / " + escapeHtml(unit) : ""}
          </p>

          <p class="small">
            ${stock > 0 ? "Stock: " + stock : "Available"}
          </p>

          <button
            type="button"
            onclick="addToCart('${product.id}')"
            ${stock <= 0 ? "" : ""}>

            🛒 Add to Cart
          </button>

        </div>
      `;

    }).join("");
}


// ================= ADD TO CART =================

function addToCart(productId) {

  const product =
    products.find(p => p.id === productId);

  if (!product) {
    alert("Product not found.");
    return;
  }

  if (product.available === false) {
    alert("This product is currently unavailable.");
    return;
  }

  const minOrder =
    Math.max(1, Number(product.minOrder || 1));

  const stock =
    Number(product.stock || 0);

  const existing =
    cart.find(item => item.id === productId);

  if (existing) {

    existing.qty += minOrder;

  } else {

    cart.push({
      id: product.id,
      name: product.name || "",
      price: Number(product.price || 0),
      unit: product.unit || "",
      qty: minOrder
    });
  }

  if (stock > 0) {

    const item =
      cart.find(item => item.id === productId);

    if (item.qty > stock) {
      item.qty = stock;
      alert("Only " + stock + " available.");
    }
  }

  saveCart();

  alert(product.name + " added to cart.");
}


// ================= SAVE CART =================

function saveCart() {

  localStorage.setItem(
    "buildmartCart",
    JSON.stringify(cart)
  );

  updateCartCount();

  updateCartTotals();
}


// ================= CART COUNT =================

function updateCartCount() {

  if (!cartLink) return;

  const count =
    cart.reduce(
      (total, item) => total + Number(item.qty || 0),
      0
    );

  cartLink.textContent =
    `🛒 Cart (${count})`;
}


// ================= OPEN CART =================

function openCart() {

  renderCartItems();

  updateCartTotals();

  if (cartModal) {
    cartModal.style.display = "flex";
  }
}


// ================= CLOSE CART =================

function closeCart() {

  if (cartModal) {
    cartModal.style.display = "none";
  }
}


// ================= CART ITEMS =================

function renderCartItems() {

  const box =
    document.getElementById("cartItems");

  if (!box) return;

  if (!cart.length) {

    box.innerHTML = `
      <p>Your cart is empty.</p>
    `;

    return;
  }

  box.innerHTML =
    cart.map((item, index) => {

      const total =
        Number(item.price || 0) *
        Number(item.qty || 0);

      return `
        <div class="cart-item">

          <div>
            <strong>
              ${escapeHtml(item.name)}
            </strong>

            <p>
              ₹${Number(item.price || 0).toLocaleString("en-IN")}
              ${item.unit ? " / " + escapeHtml(item.unit) : ""}
            </p>
          </div>

          <div>

            <button
              type="button"
              onclick="changeQty(${index}, -1)">
              −
            </button>

            <span>
              ${item.qty}
            </span>

            <button
              type="button"
              onclick="changeQty(${index}, 1)">
              +
            </button>

            <button
              type="button"
              onclick="removeFromCart(${index})">
              ❌
            </button>

          </div>

          <strong>
            ₹${total.toLocaleString("en-IN")}
          </strong>

        </div>
      `;

    }).join("");
}


// ================= CHANGE QTY =================

function changeQty(index, change) {

  if (!cart[index]) return;

  cart[index].qty =
    Number(cart[index].qty || 0) + change;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCart();

  renderCartItems();
}


// ================= REMOVE =================

function removeFromCart(index) {

  cart.splice(index, 1);

  saveCart();

  renderCartItems();
}


// ================= DELIVERY SETTINGS =================

function loadDeliverySettings() {

  db.collection("settings")
    .doc("store")
    .onSnapshot(
      doc => {

        if (!doc.exists) return;

        const data = doc.data();

        deliverySlabs =
          Array.isArray(data.deliverySlabs)
            ? data.deliverySlabs
            : [];

        freeDeliveryAbove =
          Number(data.freeDeliveryAbove || 0);

        updateCartTotals();
      },

      error => {
        console.error(
          "Delivery settings error:",
          error
        );
      }
    );
}


// ================= DELIVERY =================

function getDistance() {

  // Current checkout has only text location.
  // Real map distance can be added later.

  return 0;
}


function calculateDelivery(distanceKm, subtotal) {

  if (
    freeDeliveryAbove > 0 &&
    subtotal >= freeDeliveryAbove
  ) {
    return 0;
  }

  if (!deliverySlabs.length) {
    return 0;
  }

  const slab =
    deliverySlabs.find(
      s =>
        distanceKm >= Number(s.fromKm || 0) &&
        distanceKm <= Number(s.toKm || 0)
    );

  return slab
    ? Number(slab.charge || 0)
    : 0;
}


// ================= TOTALS =================

function getCartSubtotal() {

  return cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
      Number(item.qty || 0),
    0
  );
}


function updateCartTotals() {

  const subtotal =
    getCartSubtotal();

  const distance =
    getDistance();

  const delivery =
    calculateDelivery(
      distance,
      subtotal
    );

  const grandTotal =
    subtotal + delivery;

  const subtotalEl =
    document.getElementById("cartSubtotal");

  const deliveryEl =
    document.getElementById("deliveryCharge");

  const grandEl =
    document.getElementById("grandTotal");

  const checkoutEl =
    document.getElementById("checkoutTotal");

  if (subtotalEl) {
    subtotalEl.textContent =
      "₹" + subtotal.toLocaleString("en-IN");
  }

  if (deliveryEl) {
    deliveryEl.textContent =
      "₹" + delivery.toLocaleString("en-IN");
  }

  if (grandEl) {
    grandEl.textContent =
      "₹" + grandTotal.toLocaleString("en-IN");
  }

  if (checkoutEl) {
    checkoutEl.textContent =
      "₹" + grandTotal.toLocaleString("en-IN");
  }
}


// ================= CHECKOUT =================

function openCheckout() {

  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  updateCartTotals();

  closeCart();

  if (checkoutModal) {
    checkoutModal.style.display = "flex";
  }
}


function closeCheckout() {

  if (checkoutModal) {
    checkoutModal.style.display = "none";
  }
}


// ================= PLACE ORDER =================

async function placeOrder() {

  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  const name =
    document.getElementById("customerName")
      ?.value.trim();

  const phone =
    document.getElementById("customerPhone")
      ?.value.trim();

  const address =
    document.getElementById("customerAddress")
      ?.value.trim();

  const location =
    document.getElementById("customerLocation")
      ?.value.trim();

  const payment =
    document.querySelector(
      'input[name="payment"]:checked'
    )?.value || "COD";

  if (!name || !phone || !address) {

    alert(
      "Please enter your name, phone and address."
    );

    return;
  }

  const subtotal =
    getCartSubtotal();

  const delivery =
    calculateDelivery(
      getDistance(),
      subtotal
    );

  const total =
    subtotal + delivery;

  const orderId =
    "BM" + Date.now();

  const status =
    payment === "UPI"
      ? "Payment Pending"
      : "Order Received";

  const order = {

    orderId,

    customerName: name,

    phone,

    address,

    location,

    paymentMethod: payment,

    status,

    subtotal,

    deliveryCharge: delivery,

    total,

    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      qty: item.qty
    })),

    createdAt:
      firebase.firestore.FieldValue.serverTimestamp()

  };

  try {

    await db
      .collection("orders")
      .doc(orderId)
      .set(order);

    await db
      .collection("publicOrders")
      .doc(orderId)
      .set({

        orderId,

        customerName: name,

        phone,

        status,

        total,

        createdAt:
          firebase.firestore.FieldValue.serverTimestamp()

      });

    showSuccess(order);

    if (payment === "COD") {

      cart = [];

      saveCart();

    } else {

      setTimeout(() => {
        payWithUPI(total);
      }, 500);
    }

  } catch (error) {

    console.error(error);

    alert(
      "Order failed: " + error.message
    );
  }
}


// ================= SUCCESS =================

function showSuccess(order) {

  closeCheckout();

  document.getElementById("orderId").textContent =
    order.orderId;

  document.getElementById("orderCustomer").textContent =
    order.customerName;

  document.getElementById("orderTotal").textContent =
    "₹" + Number(order.total).toLocaleString("en-IN");

  document.getElementById("orderPayment").textContent =
    order.paymentMethod;

  const upiBox =
    document.getElementById("upiPaymentBox");

  const upiAmount =
    document.getElementById("upiAmount");

  if (order.paymentMethod === "UPI") {

    upiBox.style.display = "block";

    upiAmount.textContent =
      "₹" +
      Number(order.total).toLocaleString("en-IN");

  } else {

    upiBox.style.display = "none";
  }

  if (successModal) {
    successModal.style.display = "flex";
  }
}


// ================= CLOSE SUCCESS =================

function closeSuccess() {

  if (successModal) {
    successModal.style.display = "none";
  }
}


// ================= UPI =================

function payWithUPI(amount) {

  amount = Number(amount || 0);

  if (!amount) {
    amount = getCartSubtotal();
  }

  const upiUrl =
    "upi://pay" +
    "?pa=" + encodeURIComponent(UPI_ID) +
    "&pn=" + encodeURIComponent(STORE_NAME) +
    "&am=" + encodeURIComponent(amount.toFixed(2)) +
    "&cu=INR";

  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (!isMobile) {
    alert(
      "UPI payment ready for ₹" +
      amount.toLocaleString("en-IN") +
      ".\n\nPlease open this website on your mobile phone and tap Pay Now with UPI.\n\nUPI ID: " +
      UPI_ID
    );
    return;
  }

  window.location.href = upiUrl;
}


// ================= CART CLICK =================

if (cartLink) {

  cartLink.addEventListener(
    "click",
    function(event) {

      event.preventDefault();

      openCart();
    }
  );
}


// ================= UPDATE CART =================

function updateCartAfterProductsLoad() {

  cart = cart.filter(item =>
    products.some(p => p.id === item.id)
  );

  saveCart();
}



function getMaterialVisual(name) {

  const value = String(name || "").toLowerCase();
  let image = "";

  if (value.includes("cement ring wells") || value.includes("cement varra")) {
  image = "assets/products/cement-ring-wells.png";
}
  } else if (value.includes("ramco") || (value.includes("cement") && !value.includes("ring") && !value.includes("varra"))) {
    image = "assets/products/ramco-cement.png";
  } else if (value.includes("ring") || value.includes("well")) {
    image = "assets/products/cement-rings.png";
  } else if (value.includes("iron") || value.includes("steel") || /(^|\s)(6|8|10|12)\s*mm/.test(value)) {
    image = "assets/products/iron-rods.png";
  } else if (value.includes("brick")) {
    image = "assets/products/red-bricks.png";
  } else if (value.includes("sand")) {
    image = "assets/products/sand.png";
  } else if (value.includes("3/4") || value.includes("3-4") || value.includes("aggregate")) {
    image = "assets/products/3-4-aggregates.png";
  } else if (value.includes("baby") || value.includes("chips")) {
    image = "assets/products/baby-chips.png";
  } else if (value.includes("dust")) {
    image = "assets/products/dust.png";
  }

  if (!image) return "ðŸ—ï¸";

  return `<img src="${image}" alt="${escapeHtml(name || "Building material")}" loading="lazy">`;
}


// ================= ESCAPE HTML =================

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[char]
    );
}


// ================= START =================

loadProducts();

loadDeliverySettings();

updateCartCount();

updateCartTotals();
