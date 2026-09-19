// ===============================
// BUILD MART - script.js
// ===============================

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDErFysC_Z7dP96Gn29cblxcgsmzIneobA",
  authDomain: "buildmart-f394b.firebaseapp.com",
  projectId: "buildmart-f394b",
  storageBucket: "buildmart-f394b.firebasestorage.app",
  messagingSenderId: "255269056106",
  appId: "1:255269056106:web:60ba9cf4696ea2717ce413",
  measurementId: "G-JVRDZ49BC0"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();


// ===============================
// CART
// ===============================

let cart = JSON.parse(localStorage.getItem("buildmartCart")) || [];

function saveCart() {
  localStorage.setItem("buildmartCart", JSON.stringify(cart));
}


// Add product to cart
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      name: name,
      price: Number(price),
      quantity: 1
    });
  }

  saveCart();
  renderCart();

  alert(name + " added to cart!");
}


// Open cart
function openCart() {
  const cartModal = document.getElementById("cartModal");

  if (cartModal) {
    cartModal.style.display = "flex";
  }

  renderCart();
}


// Close cart
function closeCart() {
  const cartModal = document.getElementById("cartModal");

  if (cartModal) {
    cartModal.style.display = "none";
  }
}


// Render cart
function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p style="text-align:center;padding:30px;">
        Your cart is empty.
      </p>
    `;

    if (cartCount) {
      cartCount.textContent = "0";
    }

    updateCartTotals();
    return;
  }

  let totalItems = 0;

  cartItems.innerHTML = cart.map((item, index) => {

    totalItems += item.quantity;

    return `
      <div class="cart-item" style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        padding:12px 0;
        border-bottom:1px solid #ddd;
      ">

        <div style="flex:1;">
          <strong>${item.name}</strong>
          <div>₹${Number(item.price).toFixed(2)}</div>
        </div>

        <div style="display:flex;align-items:center;gap:8px;">

          <button
            onclick="changeQuantity(${index}, -1)"
            style="padding:5px 10px;"
          >
            −
          </button>

          <span>${item.quantity}</span>

          <button
            onclick="changeQuantity(${index}, 1)"
            style="padding:5px 10px;"
          >
            +
          </button>

        </div>

        <button
          onclick="removeFromCart(${index})"
          style="
            background:#e53935;
            color:white;
            border:none;
            padding:6px 10px;
            border-radius:5px;
            cursor:pointer;
          "
        >
          Remove
        </button>

      </div>
    `;
  }).join("");

  if (cartCount) {
    cartCount.textContent = totalItems;
  }

  updateCartTotals();
}


// Change quantity
function changeQuantity(index, change) {

  if (!cart[index]) return;

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}


// Remove item
function removeFromCart(index) {

  if (!cart[index]) return;

  cart.splice(index, 1);

  saveCart();
  renderCart();
}


// ===============================
// TOTALS
// ===============================

function calculateSubtotal() {

  return cart.reduce((total, item) => {
    return total + (Number(item.price) * Number(item.quantity));
  }, 0);

}


function calculateDelivery(subtotal) {

  if (subtotal <= 0) {
    return 0;
  }

  // Free delivery above ₹5000
  if (subtotal >= 5000) {
    return 0;
  }

  return 100;
}


function updateCartTotals() {

  const subtotal = calculateSubtotal();
  const delivery = calculateDelivery(subtotal);
  const total = subtotal + delivery;

  const subtotalElement =
    document.getElementById("cartSubtotal");

  const deliveryElement =
    document.getElementById("deliveryCharge");

  const totalElement =
    document.getElementById("cartTotal");

  if (subtotalElement) {
    subtotalElement.textContent =
      "₹" + subtotal.toFixed(2);
  }

  if (deliveryElement) {
    deliveryElement.textContent =
      delivery === 0
        ? "FREE"
        : "₹" + delivery.toFixed(2);
  }

  if (totalElement) {
    totalElement.textContent =
      "₹" + total.toFixed(2);
  }

  updateCheckoutTotal();
}


// ===============================
// CHECKOUT
// ===============================

function openCheckout() {

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  closeCart();

  const checkoutModal =
    document.getElementById("checkoutModal");

  if (checkoutModal) {
    checkoutModal.style.display = "flex";
  }

  updateCheckoutTotal();
}


function closeCheckout() {

  const checkoutModal =
    document.getElementById("checkoutModal");

  if (checkoutModal) {
    checkoutModal.style.display = "none";
  }
}


// Update checkout total
function updateCheckoutTotal() {

  const subtotal = calculateSubtotal();
  const delivery = calculateDelivery(subtotal);
  const total = subtotal + delivery;

  const checkoutTotal =
    document.getElementById("checkoutTotal");

  if (checkoutTotal) {
    checkoutTotal.textContent =
      "₹" + total.toFixed(2);
  }
}


// ===============================
// PAYMENT UI
// ===============================

function setupPaymentUI() {

  const paymentRadios =
    document.querySelectorAll(
      'input[name="paymentMethod"]'
    );

  const upiBox =
    document.getElementById("upiPaymentBox");

  if (!paymentRadios.length) return;

  paymentRadios.forEach(radio => {

    radio.addEventListener("change", function () {

      if (!upiBox) return;

      if (this.value === "UPI") {
        upiBox.style.display = "block";
      } else {
        upiBox.style.display = "none";
      }

    });

  });

}


// ===============================
// ORDER ID
// ===============================

function generateOrderId() {

  return "BM" +
    Math.floor(
      100000 +
      Math.random() * 900000
    );

}


// ===============================
// PLACE ORDER
// ===============================

async function placeOrder() {

  try {

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }


    const customerName =
      document.getElementById("customerName")?.value.trim();

    const customerPhone =
      document.getElementById("customerPhone")?.value.trim();

    const customerAddress =
      document.getElementById("customerAddress")?.value.trim();

    const customerLocation =
      document.getElementById("customerLocation")?.value.trim();


    if (!customerName ||
        !customerPhone ||
        !customerAddress ||
        !customerLocation) {

      alert("Please fill all customer details.");
      return;
    }


    const paymentRadio =
      document.querySelector(
        'input[name="paymentMethod"]:checked'
      );


    if (!paymentRadio) {

      alert("Please select a payment method.");
      return;
    }


    const paymentMethod =
      paymentRadio.value;


    const subtotal =
      calculateSubtotal();

    const delivery =
      calculateDelivery(subtotal);

    const grandTotal =
      subtotal + delivery;


    const orderId =
      generateOrderId();


    // UPI orders start as Payment Pending
    // COD orders start as Order Received

    const initialStatus =
      paymentMethod === "UPI"
        ? "Payment Pending"
        : "Order Received";


    // Order items
    const items =
      cart.map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }));


    // Private order
    const orderData = {

      orderId: orderId,

      customerName: customerName,

      customerPhone: customerPhone,

      customerAddress: customerAddress,

      customerLocation: customerLocation,

      items: items,

      subtotal: subtotal,

      delivery: delivery,

      total: grandTotal,

      paymentMethod: paymentMethod,

      status: initialStatus,

      createdAt:
        firebase.firestore.FieldValue.serverTimestamp()

    };


    // Public tracking data
    const publicOrderData = {

      orderId: orderId,

      status: initialStatus,

      items: items,

      total: grandTotal,

      paymentMethod: paymentMethod,

      createdAt:
        firebase.firestore.FieldValue.serverTimestamp()

    };


    // Save both orders together
    const batch =
      db.batch();


    const privateOrderRef =
      db.collection("orders")
        .doc(orderId);


    const publicOrderRef =
      db.collection("publicOrders")
        .doc(orderId);


    batch.set(
      privateOrderRef,
      orderData
    );


    batch.set(
      publicOrderRef,
      publicOrderData
    );


    await batch.commit();


    // ==========================
    // COD
    // ==========================

    if (paymentMethod === "COD") {

      showOrderSuccess(
        orderId,
        grandTotal,
        "Cash on Delivery"
      );

      clearCartAndForm();

      return;
    }


    // ==========================
    // UPI
    // ==========================

    if (paymentMethod === "UPI") {

      closeCheckout();


      alert(
        "Order created.\n\n" +
        "Payment is Pending.\n\n" +
        "Complete the UPI payment to continue."
      );


      // Open UPI payment
      payWithUPI(
        orderId,
        grandTotal
      );


      // IMPORTANT:
      // Cart is NOT cleared here.
      // Payment is not automatically verified.
      return;
    }


  } catch (error) {

    console.error(
      "Order error:",
      error
    );

    alert(
      "Something went wrong while placing the order.\n\n" +
      error.message
    );

  }

}


// ===============================
// UPI PAYMENT
// ===============================

function payWithUPI(
  orderId,
  amount
) {

  // Daddy's PhonePe UPI ID
  const upiId =
    "9000158191@ibl";


  const upiUrl =
    "upi://pay" +

    "?pa=" +
    encodeURIComponent(upiId) +

    "&pn=" +
    encodeURIComponent("BuildMart") +

    "&am=" +
    encodeURIComponent(
      Number(amount).toFixed(2)
    ) +

    "&cu=INR" +

    "&tn=" +
    encodeURIComponent(
      "BuildMart Order " + orderId
    );


  console.log(
    "UPI Payment URL:",
    upiUrl
  );


  // Open UPI app
  window.location.href =
    upiUrl;

}


// ===============================
// SUCCESS MODAL
// ===============================

function showOrderSuccess(
  orderId,
  amount,
  paymentMethod
) {

  const successModal =
    document.getElementById("successModal");

  if (!successModal) {

    alert(
      "Order placed successfully!\n\n" +
      "Order ID: " + orderId +
      "\nTotal: ₹" + amount.toFixed(2)
    );

    return;
  }


  const orderIdElement =
    document.getElementById("orderId");

  const orderTotalElement =
    document.getElementById("orderTotal");

  const paymentMethodElement =
    document.getElementById("successPaymentMethod");


  if (orderIdElement) {
    orderIdElement.textContent =
      orderId;
  }


  if (orderTotalElement) {
    orderTotalElement.textContent =
      "₹" + amount.toFixed(2);
  }


  if (paymentMethodElement) {
    paymentMethodElement.textContent =
      paymentMethod;
  }


  // Hide UPI box in success modal
  const upiBox =
    document.getElementById("upiPaymentBox");

  if (upiBox) {
    upiBox.style.display = "none";
  }


  successModal.style.display =
    "flex";

}


// ===============================
// CLEAR CART + FORM
// ===============================

function clearCartAndForm() {

  cart = [];

  saveCart();

  renderCart();


  const fields = [
    "customerName",
    "customerPhone",
    "customerAddress",
    "customerLocation"
  ];


  fields.forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }

  });


  // Reset payment method
  const codRadio =
    document.querySelector(
      'input[name="paymentMethod"][value="COD"]'
    );


  if (codRadio) {
    codRadio.checked = true;
  }


  const upiBox =
    document.getElementById("upiPaymentBox");


  if (upiBox) {
    upiBox.style.display =
      "none";
  }

}


// ===============================
// CLOSE SUCCESS MODAL
// ===============================

function closeSuccessModal() {

  const successModal =
    document.getElementById("successModal");

  if (successModal) {
    successModal.style.display =
      "none";
  }

}


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    renderCart();

    setupPaymentUI();

    updateCheckoutTotal();

  }
);
