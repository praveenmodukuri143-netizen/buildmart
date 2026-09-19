// ===============================
// BUILD MART - FIREBASE SETUP
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyDErFysC_Z7dP96Gn29cblxcgsmzIneobA",
  authDomain: "buildmart-f394b.firebaseapp.com",
  projectId: "buildmart-f394b",
  storageBucket: "buildmart-f394b.firebasestorage.app",
  messagingSenderId: "255269056106",
  appId: "1:255269056106:web:60ba9cf4696ea2717ce413",
  measurementId: "G-JVRDZ49BC0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// ===============================
// CART
// ===============================

let cart = JSON.parse(localStorage.getItem("buildmartCart")) || [];

function saveCart() {
  localStorage.setItem("buildmartCart", JSON.stringify(cart));
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      name: name,
      price: price,
      quantity: 1
    });
  }

  saveCart();
  updateCartCount();

  alert(name + " added to cart!");
}

function updateCartCount() {
  const cartLink = document.getElementById("cartLink");

  if (cartLink) {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartLink.textContent = `🛒 Cart (${count})`;
  }
}


// ===============================
// CART MODAL
// ===============================

function openCart() {
  const modal = document.getElementById("cartModal");

  if (modal) {
    modal.style.display = "flex";
    displayCart();
  }
}

function closeCart() {
  const modal = document.getElementById("cartModal");

  if (modal) {
    modal.style.display = "none";
  }
}

function displayCart() {
  const cartItems = document.getElementById("cartItems");
  const subtotalElement = document.getElementById("cartSubtotal");
  const deliveryElement = document.getElementById("deliveryCharge");
  const grandTotalElement = document.getElementById("grandTotal");

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";

    if (subtotalElement) subtotalElement.textContent = "₹0";
    if (deliveryElement) deliveryElement.textContent = "₹0";
    if (grandTotalElement) grandTotalElement.textContent = "₹0";

    return;
  }

  let subtotal = 0;

  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    cartItems.innerHTML += `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <p>₹${item.price} × ${item.quantity}</p>
        </div>

        <div class="quantity-controls">
          <button onclick="changeQuantity(${index}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${index}, 1)">+</button>
        </div>

        <strong>₹${itemTotal}</strong>

        <button onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;
  });

  const delivery = subtotal >= 5000 ? 0 : 100;
  const grandTotal = subtotal + delivery;

  if (subtotalElement) {
    subtotalElement.textContent = `₹${subtotal}`;
  }

  if (deliveryElement) {
    deliveryElement.textContent =
      delivery === 0 ? "FREE" : `₹${delivery}`;
  }

  if (grandTotalElement) {
    grandTotalElement.textContent = `₹${grandTotal}`;
  }
}

function changeQuantity(index, change) {
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  updateCartCount();
  displayCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);

  saveCart();
  updateCartCount();
  displayCart();
}


// ===============================
// CHECKOUT
// ===============================

function openCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  closeCart();

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const delivery = subtotal >= 5000 ? 0 : 100;
  const grandTotal = subtotal + delivery;

  const checkoutTotal = document.getElementById("checkoutTotal");

  if (checkoutTotal) {
    checkoutTotal.textContent = `₹${grandTotal}`;
  }

  const checkoutModal = document.getElementById("checkoutModal");

  if (checkoutModal) {
    checkoutModal.style.display = "flex";
  }
}

function closeCheckout() {
  const modal = document.getElementById("checkoutModal");

  if (modal) {
    modal.style.display = "none";
  }
}


// ===============================
// PLACE ORDER → FIRESTORE
// ===============================

async function placeOrder() {

  const name = document.getElementById("customerName")?.value.trim();
  const phone = document.getElementById("customerPhone")?.value.trim();
  const address = document.getElementById("customerAddress")?.value.trim();
  const location = document.getElementById("customerLocation")?.value.trim();

  const paymentElement = document.querySelector(
    'input[name="payment"]:checked'
  );

  const payment = paymentElement ? paymentElement.value : "COD";

  if (!name || !phone || !address || !location) {
    alert("Please fill all customer details.");
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const delivery = subtotal >= 5000 ? 0 : 100;
  const grandTotal = subtotal + delivery;

  const orderId =
    "BM" + Math.floor(10000000 + Math.random() * 90000000);

  const order = {
    orderId: orderId,
    customerName: name,
    phone: phone,
    address: address,
    location: location,
    payment: payment,
    items: cart,
    subtotal: subtotal,
    delivery: delivery,
    total: grandTotal,
    status: "Order Received",
    date: new Date().toLocaleString()
  };

  try {

    // SAVE ORDER TO FIRESTORE
    await db.collection("orders").doc(orderId).set(order);

    // SHOW SUCCESS MODAL
    document.getElementById("orderId").textContent = orderId;
    document.getElementById("orderCustomer").textContent = name;
    document.getElementById("orderTotal").textContent = `₹${grandTotal}`;
    document.getElementById("orderPayment").textContent = payment;

    closeCheckout();

    document.getElementById("successModal").style.display = "flex";

    // CLEAR CART
    cart = [];
    saveCart();
    updateCartCount();

    // CLEAR FORM
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerAddress").value = "";
    document.getElementById("customerLocation").value = "";

    console.log("Order saved to Firestore:", order);

  } catch (error) {

    console.error("Firestore error:", error);

    alert(
      "Order save avvaledu. Please check Firebase connection."
    );
  }
}


// ===============================
// SUCCESS MODAL
// ===============================

function closeSuccess() {
  const modal = document.getElementById("successModal");

  if (modal) {
    modal.style.display = "none";
  }
}


// ===============================
// INITIAL LOAD
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  updateCartCount();

  const cartLink = document.getElementById("cartLink");

  if (cartLink) {
    cartLink.addEventListener("click", function (event) {
      event.preventDefault();
      openCart();
    });
  }

});