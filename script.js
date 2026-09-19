// ============================================
// BUILDMART - FIREBASE
// ============================================

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


// ============================================
// CART
// ============================================

let cart =
  JSON.parse(localStorage.getItem("buildmartCart")) || [];


// ============================================
// SAVE CART
// ============================================

function saveCart() {
  localStorage.setItem(
    "buildmartCart",
    JSON.stringify(cart)
  );
}


// ============================================
// CART COUNT
// ============================================

function updateCartCount() {

  const cartLink =
    document.getElementById("cartLink");

  if (!cartLink) return;

  const totalItems =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  cartLink.textContent =
    `🛒 Cart (${totalItems})`;
}


// ============================================
// ADD TO CART
// ============================================

function addToCart(name, price) {

  const existingItem =
    cart.find(
      item => item.name === name
    );

  if (existingItem) {

    existingItem.quantity += 1;

  } else {

    cart.push({
      name: name,
      price: Number(price),
      quantity: 1
    });
  }

  saveCart();
  updateCartCount();

  alert(
    `${name} added to cart!`
  );
}


// ============================================
// OPEN CART
// ============================================

function openCart() {

  const cartModal =
    document.getElementById("cartModal");

  if (cartModal) {
    cartModal.style.display = "flex";
  }

  renderCart();
}


// ============================================
// CLOSE CART
// ============================================

function closeCart() {

  const cartModal =
    document.getElementById("cartModal");

  if (cartModal) {
    cartModal.style.display = "none";
  }
}


// ============================================
// RENDER CART
// ============================================

function renderCart() {

  const cartItems =
    document.getElementById("cartItems");

  if (!cartItems) return;

  cartItems.innerHTML = "";

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <p>Your cart is empty.</p>
      </div>
    `;

    updateCartTotals();
    return;
  }


  cart.forEach(
    (item, index) => {

      const itemTotal =
        item.price * item.quantity;

      const div =
        document.createElement("div");

      div.className = "cart-item";

      div.innerHTML = `

        <div class="cart-item-info">

          <strong>
            ${item.name}
          </strong>

          <p>
            ₹${item.price.toLocaleString("en-IN")}
            × ${item.quantity}
          </p>

        </div>

        <div class="cart-item-actions">

          <button
            type="button"
            onclick="decreaseQuantity(${index})">
            −
          </button>

          <span>
            ${item.quantity}
          </span>

          <button
            type="button"
            onclick="increaseQuantity(${index})">
            +
          </button>

          <strong>
            ₹${itemTotal.toLocaleString("en-IN")}
          </strong>

          <button
            type="button"
            onclick="removeFromCart(${index})">
            ❌
          </button>

        </div>

      `;

      cartItems.appendChild(div);
    }
  );

  updateCartTotals();
}


// ============================================
// INCREASE QUANTITY
// ============================================

function increaseQuantity(index) {

  if (!cart[index]) return;

  cart[index].quantity += 1;

  saveCart();
  renderCart();
  updateCartCount();
}


// ============================================
// DECREASE QUANTITY
// ============================================

function decreaseQuantity(index) {

  if (!cart[index]) return;

  if (cart[index].quantity > 1) {

    cart[index].quantity -= 1;

  } else {

    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
  updateCartCount();
}


// ============================================
// REMOVE ITEM
// ============================================

function removeFromCart(index) {

  if (!cart[index]) return;

  cart.splice(index, 1);

  saveCart();
  renderCart();
  updateCartCount();
}


// ============================================
// CART TOTALS
// ============================================

function updateCartTotals() {

  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        item.price *
        item.quantity,
      0
    );

  const delivery =
    subtotal === 0
      ? 0
      : subtotal >= 5000
        ? 0
        : 100;

  const grandTotal =
    subtotal + delivery;


  const subtotalElement =
    document.getElementById(
      "cartSubtotal"
    );

  const deliveryElement =
    document.getElementById(
      "deliveryCharge"
    );

  const grandTotalElement =
    document.getElementById(
      "grandTotal"
    );

  const checkoutTotalElement =
    document.getElementById(
      "checkoutTotal"
    );


  if (subtotalElement) {

    subtotalElement.textContent =
      `₹${subtotal.toLocaleString("en-IN")}`;
  }


  if (deliveryElement) {

    deliveryElement.textContent =
      delivery === 0
        ? "FREE"
        : `₹${delivery}`;
  }


  if (grandTotalElement) {

    grandTotalElement.textContent =
      `₹${grandTotal.toLocaleString("en-IN")}`;
  }


  if (checkoutTotalElement) {

    checkoutTotalElement.textContent =
      `₹${grandTotal.toLocaleString("en-IN")}`;
  }
}


// ============================================
// OPEN CHECKOUT
// ============================================

function openCheckout() {

  if (cart.length === 0) {

    alert(
      "Your cart is empty."
    );

    return;
  }

  closeCart();

  const checkoutModal =
    document.getElementById(
      "checkoutModal"
    );

  if (checkoutModal) {

    checkoutModal.style.display =
      "flex";
  }

  updateCartTotals();
}


// ============================================
// CLOSE CHECKOUT
// ============================================

function closeCheckout() {

  const checkoutModal =
    document.getElementById(
      "checkoutModal"
    );

  if (checkoutModal) {

    checkoutModal.style.display =
      "none";
  }
}


// ============================================
// GENERATE ORDER ID
// ============================================

function generateOrderId() {

  return (
    "BM" +
    Math.floor(
      10000000 +
      Math.random() * 90000000
    )
  );
}


// ============================================
// PLACE ORDER
// ============================================

async function placeOrder() {

  const name =
    document
      .getElementById("customerName")
      ?.value
      .trim();

  const phone =
    document
      .getElementById("customerPhone")
      ?.value
      .trim();

  const address =
    document
      .getElementById("customerAddress")
      ?.value
      .trim();

  const location =
    document
      .getElementById("customerLocation")
      ?.value
      .trim();

  const paymentElement =
    document.querySelector(
      'input[name="payment"]:checked'
    );

  const payment =
    paymentElement
      ? paymentElement.value
      : "COD";


  // ========================================
  // VALIDATION
  // ========================================

  if (
    !name ||
    !phone ||
    !address ||
    !location
  ) {

    alert(
      "Please fill all customer details."
    );

    return;
  }


  if (cart.length === 0) {

    alert(
      "Your cart is empty."
    );

    return;
  }


  // ========================================
  // TOTAL
  // ========================================

  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        item.price *
        item.quantity,
      0
    );

  const delivery =
    subtotal >= 5000
      ? 0
      : 100;

  const grandTotal =
    subtotal + delivery;


  // ========================================
  // ORDER ID
  // ========================================

  const orderId =
    generateOrderId();


  // ========================================
  // STATUS
  // ========================================

  /*
    COD:
    Order Received

    UPI:
    Payment Pending

    IMPORTANT:
    UPI payment is NOT marked
    successful automatically.
  */

  const initialStatus =
    payment === "UPI"
      ? "Payment Pending"
      : "Order Received";


  // ========================================
  // PRIVATE ORDER
  // ========================================

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

    status: initialStatus,

    date: new Date().toLocaleString()

  };


  // ========================================
  // PUBLIC ORDER
  // ========================================

  const publicOrder = {

    orderId: orderId,

    status: initialStatus,

    date: order.date,

    items: cart,

    total: grandTotal

  };


  try {

    console.log(
      "Saving order:",
      orderId
    );


    // ======================================
    // FIRESTORE BATCH
    // ======================================

    const batch =
      db.batch();


    const privateOrderRef =
      db
        .collection("orders")
        .doc(orderId);


    batch.set(
      privateOrderRef,
      order
    );


    const publicOrderRef =
      db
        .collection("publicOrders")
        .doc(orderId);


    batch.set(
      publicOrderRef,
      publicOrder
    );


    // ======================================
    // SAVE BOTH ORDERS
    // ======================================

    await batch.commit();


    console.log(
      "Order saved successfully:",
      orderId
    );


    // ======================================
    // COD ORDER
    // ======================================

    if (payment === "COD") {

      showOrderSuccess(
        orderId,
        name,
        grandTotal,
        "COD"
      );

      clearCartAndForm();

      return;
    }


    // ======================================
    // UPI ORDER
    // ======================================

    if (payment === "UPI") {

      closeCheckout();


      /*
        IMPORTANT:

        We DO NOT show "Payment Successful".

        Order remains:

        Payment Pending

        until a real payment gateway
        verifies the payment.
      */

      alert(
        "Order created successfully.\n\n" +
        "Payment Status: Payment Pending\n\n" +
        "Your UPI payment screen will open next."
      );


      payWithUPI(
        orderId,
        grandTotal
      );


      /*
        Do NOT clear the cart here.

        If payment fails or user closes
        the UPI app, the order remains
        Payment Pending.
      */

      return;
    }


  } catch (error) {

    console.error(
      "Firestore order error:",
      error
    );


    alert(
      "Order save avvaledu. Firebase Firestore Rules check cheyyandi."
    );
  }
}


// ============================================
// SHOW COD SUCCESS
// ============================================

function showOrderSuccess(
  orderId,
  name,
  grandTotal,
  payment
) {

  const orderIdElement =
    document.getElementById(
      "orderId"
    );

  const orderCustomerElement =
    document.getElementById(
      "orderCustomer"
    );

  const orderTotalElement =
    document.getElementById(
      "orderTotal"
    );

  const orderPaymentElement =
    document.getElementById(
      "orderPayment"
    );


  if (orderIdElement) {

    orderIdElement.textContent =
      orderId;
  }


  if (orderCustomerElement) {

    orderCustomerElement.textContent =
      name;
  }


  if (orderTotalElement) {

    orderTotalElement.textContent =
      `₹${grandTotal.toLocaleString("en-IN")}`;
  }


  if (orderPaymentElement) {

    orderPaymentElement.textContent =
      payment;
  }


  // ========================================
  // HIDE UPI BOX
  // ========================================

  const upiPaymentBox =
    document.getElementById(
      "upiPaymentBox"
    );

  if (upiPaymentBox) {

    upiPaymentBox.style.display =
      "none";
  }


  // ========================================
  // SHOW SUCCESS MODAL
  // ========================================

  const successModal =
    document.getElementById(
      "successModal"
    );

  if (successModal) {

    successModal.style.display =
      "flex";
  }
}


// ============================================
// UPI PAYMENT
// ============================================

function payWithUPI(
  orderId,
  amount
) {

  if (!orderId || !amount) {

    alert(
      "Payment details not found."
    );

    return;
  }


  const upiId =
    "9848676751@fam";


  const upiUrl =
    "upi://pay" +
    "?pa=" +
    encodeURIComponent(upiId) +
    "&pn=" +
    encodeURIComponent("BuildMart") +
    "&am=" +
    encodeURIComponent(amount) +
    "&cu=INR" +
    "&tn=" +
    encodeURIComponent(
      "BuildMart Order " +
      orderId
    );


  console.log(
    "Opening UPI payment:",
    upiUrl
  );


  // ========================================
  // OPEN UPI APP
  // ========================================

  window.location.href =
    upiUrl;
}


// ============================================
// CLOSE SUCCESS
// ============================================

function closeSuccess() {

  const successModal =
    document.getElementById(
      "successModal"
    );

  if (successModal) {

    successModal.style.display =
      "none";
  }
}


// ============================================
// CLEAR CART + FORM
// ============================================

function clearCartAndForm() {

  // CLEAR CART

  cart = [];

  saveCart();

  updateCartCount();


  // CLEAR FORM

  const fields = [
    "customerName",
    "customerPhone",
    "customerAddress",
    "customerLocation"
  ];


  fields.forEach(
    function (id) {

      const element =
        document.getElementById(id);

      if (element) {

        element.value = "";
      }
    }
  );
}


// ============================================
// INITIAL PAGE LOAD
// ============================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    updateCartCount();


    const cartLink =
      document.getElementById(
        "cartLink"
      );


    if (cartLink) {

      cartLink.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          openCart();
        }
      );
    }


    /*
      Make sure cart totals
      are correct when page loads.
    */

    updateCartTotals();

  }
);
