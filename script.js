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

let cart = JSON.parse(localStorage.getItem("buildmartCart")) || [];


// ===============================
// CART
// ===============================

function saveCart() {
  localStorage.setItem(
    "buildmartCart",
    JSON.stringify(cart)
  );
}


function addToCart(name, price) {

  const existing =
    cart.find(item => item.name === name);

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

  alert(name + " added to cart.");
}


function openCart() {

  renderCart();

  const modal =
    document.getElementById("cartModal");

  if (modal) {
    modal.style.display = "flex";
  }
}


function closeCart() {

  const modal =
    document.getElementById("cartModal");

  if (modal) {
    modal.style.display = "none";
  }
}


function renderCart() {

  const cartItems =
    document.getElementById("cartItems");

  if (!cartItems) return;

  if (cart.length === 0) {

    cartItems.innerHTML =
      "<p>Your cart is empty.</p>";

    updateCartTotals();

    return;
  }

  cartItems.innerHTML = "";

  cart.forEach((item, index) => {

    const div =
      document.createElement("div");

    div.className = "cart-item";

    div.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <br>
        ₹${Number(item.price).toLocaleString("en-IN")}
      </div>

      <div>
        <button onclick="changeQuantity(${index}, -1)">−</button>

        <span style="margin:0 10px;">
          ${item.quantity}
        </span>

        <button onclick="changeQuantity(${index}, 1)">+</button>
      </div>

      <div>
        ₹${(
          Number(item.price) *
          Number(item.quantity)
        ).toLocaleString("en-IN")}
      </div>

      <button onclick="removeFromCart(${index})">
        ✕
      </button>
    `;

    cartItems.appendChild(div);

  });

  updateCartTotals();
}


function changeQuantity(index, change) {

  if (!cart[index]) return;

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart();

  renderCart();
}


function removeFromCart(index) {

  cart.splice(index, 1);

  saveCart();

  renderCart();
}


function updateCartTotals() {

  let subtotal = 0;

  cart.forEach(item => {

    subtotal +=
      Number(item.price) *
      Number(item.quantity);

  });

  let delivery = 0;

  if (subtotal > 0 && subtotal < 5000) {
    delivery = 100;
  }

  const grandTotal =
    subtotal + delivery;


  const subtotalEl =
    document.getElementById("cartSubtotal");

  const deliveryEl =
    document.getElementById("deliveryCharge");

  const grandTotalEl =
    document.getElementById("grandTotal");


  if (subtotalEl) {
    subtotalEl.textContent =
      "₹" + subtotal.toLocaleString("en-IN");
  }

  if (deliveryEl) {
    deliveryEl.textContent =
      "₹" + delivery.toLocaleString("en-IN");
  }

  if (grandTotalEl) {
    grandTotalEl.textContent =
      "₹" + grandTotal.toLocaleString("en-IN");
  }

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

  const checkout =
    document.getElementById("checkoutModal");

  if (checkout) {
    checkout.style.display = "flex";
  }

  updateCheckoutTotal();
}


function closeCheckout() {

  const checkout =
    document.getElementById("checkoutModal");

  if (checkout) {
    checkout.style.display = "none";
  }

}


function updateCheckoutTotal() {

  let subtotal = 0;

  cart.forEach(item => {

    subtotal +=
      Number(item.price) *
      Number(item.quantity);

  });

  let delivery = 0;

  if (subtotal > 0 && subtotal < 5000) {
    delivery = 100;
  }

  const total =
    subtotal + delivery;


  const checkoutTotal =
    document.getElementById("checkoutTotal");

  if (checkoutTotal) {

    checkoutTotal.textContent =
      "₹" + total.toLocaleString("en-IN");

  }

}


function generateOrderId() {

  const random =
    Math.floor(
      100000 + Math.random() * 900000
    );

  return "BM" + random;
}


// ===============================
// PLACE ORDER
// ===============================

async function placeOrder() {

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }


  const customerName =
    document
      .getElementById("customerName")
      ?.value
      .trim();

  const customerPhone =
    document
      .getElementById("customerPhone")
      ?.value
      .trim();

  const customerAddress =
    document
      .getElementById("customerAddress")
      ?.value
      .trim();

  const customerLocation =
    document
      .getElementById("customerLocation")
      ?.value
      .trim();


  if (
    !customerName ||
    !customerPhone ||
    !customerAddress ||
    !customerLocation
  ) {

    alert(
      "Please fill all customer details."
    );

    return;
  }


  const paymentMethod =
    document.querySelector(
      'input[name="payment"]:checked'
    )?.value;


  if (!paymentMethod) {

    alert(
      "Please select a payment method."
    );

    return;
  }


  let subtotal = 0;

  cart.forEach(item => {

    subtotal +=
      Number(item.price) *
      Number(item.quantity);

  });


  let delivery = 0;

  if (subtotal > 0 && subtotal < 5000) {
    delivery = 100;
  }


  const grandTotal =
    subtotal + delivery;


  const orderId =
    generateOrderId();


  /*
    IMPORTANT:

    COD:
    Order Received

    UPI:
    Payment Pending

    We DO NOT mark UPI as paid here.
  */

  const initialStatus =
    paymentMethod === "UPI"
      ? "Payment Pending"
      : "Order Received";


  const createdAt =
    firebase.firestore.FieldValue.serverTimestamp();


  const orderData = {

    orderId: orderId,

    customerName: customerName,

    customerPhone: customerPhone,

    customerAddress: customerAddress,

    customerLocation: customerLocation,

    items: cart.map(item => ({
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    })),

    subtotal: subtotal,

    delivery: delivery,

    total: grandTotal,

    paymentMethod: paymentMethod,

    status: initialStatus,

    createdAt: createdAt

  };


  /*
    Public tracking data.
    Customer can see only tracking information.
  */

  const publicOrderData = {

    orderId: orderId,

    items: cart.map(item => ({
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    })),

    total: grandTotal,

    status: initialStatus,

    createdAt: createdAt

  };


  try {

    const batch =
      db.batch();


    const privateOrderRef =
      db
        .collection("orders")
        .doc(orderId);


    const publicOrderRef =
      db
        .collection("publicOrders")
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


    // =========================
    // COD
    // =========================

    if (paymentMethod === "COD") {

      showOrderSuccess(
        orderId,
        grandTotal,
        "Cash on Delivery"
      );

      clearCartAndForm();

      return;
    }


    // =========================
    // UPI
    // =========================

    if (paymentMethod === "UPI") {

      closeCheckout();


      /*
        IMPORTANT:

        DO NOT show "Order Confirmed".

        DO NOT clear cart.

        Order remains Payment Pending
        until actual payment verification.
      */

      alert(
        "Order created. Payment is Pending. Complete the UPI payment to continue."
      );


      payWithUPI(
        orderId,
        grandTotal
      );

      return;
    }


  } catch (error) {

    console.error(
      "Order Error:",
      error
    );

    alert(
      "Order could not be placed.\n\n" +
      error.message
    );

  }

}


// ===============================
// COD SUCCESS ONLY
// ===============================

function showOrderSuccess(
  orderId,
  total,
  paymentMethod
) {

  const successModal =
    document.getElementById(
      "successModal"
    );

  if (!successModal) return;


  const orderIdEl =
    document.getElementById(
      "orderId"
    );

  const orderCustomerEl =
    document.getElementById(
      "orderCustomer"
    );

  const orderTotalEl =
    document.getElementById(
      "orderTotal"
    );

  const orderPaymentEl =
    document.getElementById(
      "orderPayment"
    );


  if (orderIdEl) {
    orderIdEl.textContent =
      orderId;
  }

  if (orderCustomerEl) {

    orderCustomerEl.textContent =
      document
        .getElementById("customerName")
        ?.value
        .trim() || "";

  }

  if (orderTotalEl) {

    orderTotalEl.textContent =
      "₹" +
      Number(total)
        .toLocaleString("en-IN");

  }

  if (orderPaymentEl) {

    orderPaymentEl.textContent =
      paymentMethod;

  }


  const upiBox =
    document.getElementById(
      "upiPaymentBox"
    );

  if (upiBox) {
    upiBox.style.display = "none";
  }


  successModal.style.display =
    "flex";

}


// ===============================
// UPI PAYMENT
// ===============================

function payWithUPI(
  orderId,
  amount
) {

  const upiId =
    "9848676751@fam";


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
      "BuildMart Order " +
      orderId
    );


  /*
    This opens a compatible UPI app
    when the device/browser supports
    UPI deep links.

    IMPORTANT:
    This does NOT verify payment success.
  */

  window.location.href =
    upiUrl;

}


// ===============================
// SUCCESS MODAL CLOSE
// ===============================

function closeSuccess() {

  const modal =
    document.getElementById(
      "successModal"
    );

  if (modal) {
    modal.style.display = "none";
  }

}


// ===============================
// CLEAR CART
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


  const checkout =
    document.getElementById(
      "checkoutModal"
    );

  if (checkout) {
    checkout.style.display = "none";
  }

}


// ===============================
// PAYMENT UI
// ===============================

function setupPaymentUI() {

  const paymentRadios =
    document.querySelectorAll(
      'input[name="payment"]'
    );


  paymentRadios.forEach(radio => {

    radio.addEventListener(
      "change",
      function () {

        const upiBox =
          document.getElementById(
            "upiPaymentBox"
          );

        if (!upiBox) return;


        if (this.value === "UPI") {

          upiBox.style.display =
            "block";

        } else {

          upiBox.style.display =
            "none";

        }

      }
    );

  });

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
