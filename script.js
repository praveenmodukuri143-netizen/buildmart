/* Srinivasa Building Materials - Premium Catalogue */

const CONTACT_NUMBER = "9000158191";
const WHATSAPP_NUMBER = "919000158191";
const SECOND_WHATSAPP_NUMBER = "919848676751";

const products = [
  { name: "Ramco Cement", image: "assets/products/ramco-cement.png", description: "Reliable cement for home and building construction." },
  { name: "Iron Rods", image: "assets/products/iron-rods.png", description: "Quality reinforcement steel for strong RCC construction." },
  { name: "Cement Ring Wells", image: "assets/products/cement-ring-wells.png", description: "Precast cement ring wells for water and utility requirements." },
  { name: "Red Bricks", image: "assets/products/red-bricks.png", description: "Durable red bricks for walls and general construction." },
  { name: "Sand", image: "assets/products/sand.png", description: "Construction sand for masonry, plastering and concrete work." },
  { name: "3/4 Aggregates", image: "assets/products/3-4-aggregates.png", description: "Quality aggregates for concrete and construction work." },
  { name: "Baby Chips", image: "assets/products/baby-chips.png", description: "Small-size stone chips for construction applications." },
  { name: "Dust", image: "assets/products/dust.png", description: "Stone dust for filling and construction requirements." },
  { name: "Cement Flower Pots", image: "assets/products/cement-flower-pots.png", description: "Precast cement flower pots for homes and outdoor spaces." },
  { name: "Cement Ventilators", image: "assets/products/cement-ventilators.png", description: "Precast cement ventilators for building ventilation." },
  { name: "Cement Chulhas", image: "assets/products/cement-chulhas.png", description: "Strong precast cement chulhas for practical use." },
  { name: "Cement Door Frames", image: "assets/products/cement-door-frames.png", description: "Precast cement door frames for construction projects." },
  { name: "Cement Ring Well Plates", image: "assets/products/cement-ring-well-plates.png", description: "Cement plates made for ring well applications." },
  { name: "Cement Windows", image: "assets/products/cement-windows.png", description: "Precast cement window frames for building projects." },
  { name: "Cement Exhaust Fan Rings", image: "assets/products/cement-exhaust-fan-rings.png", description: "Cement rings for exhaust fan installation requirements." }
];

const transportServices = [
  { name: "Auto", image: "assets/products/auto.png", description: "Local loading and transport support. Call to discuss load, distance and requirement." },
  { name: "Tata Ace", image: "assets/products/tata-ace.png", description: "Transport support for materials and local deliveries. Call to discuss load and distance." }
];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function whatsappUrl(productName) {
  const text = encodeURIComponent(`Hello Srinivasa Building Materials, I need information about ${productName}. Please share availability and latest price.`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function renderCard(item, type = "product") {
  const safeName = escapeHtml(item.name);
  return `
    <article class="${type}-card">
      <div class="${type}-image">
        <img src="${item.image}" alt="${safeName}" loading="lazy">
      </div>
      <h3>${safeName}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="${type}-actions">
        <a class="call-btn" href="tel:+91${CONTACT_NUMBER}">📞 Call</a>
        <a class="whatsapp-btn" href="${whatsappUrl(item.name)}" target="_blank" rel="noopener noreferrer">🟢 WhatsApp</a>
      </div>
    </article>
  `;
}

function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  container.innerHTML = products.map(product => renderCard(product, "product")).join("");
}

function renderTransport() {
  const container = document.getElementById("transportContainer");
  if (!container) return;
  container.innerHTML = transportServices.map(service => renderCard(service, "transport")).join("");
}

function setupContactLinks() {
  document.querySelectorAll("[data-phone-link]").forEach(link => {
    link.href = `tel:+91${CONTACT_NUMBER}`;
  });

  document.querySelectorAll("[data-whatsapp-link]").forEach(link => {
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Srinivasa Building Materials, I need construction materials.")}`;
  });

  const second = document.querySelector("[data-whatsapp-link-2]");
  if (second) {
    second.href = `https://wa.me/${SECOND_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Srinivasa Building Materials, I need construction materials.")}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderTransport();
  setupContactLinks();
});
