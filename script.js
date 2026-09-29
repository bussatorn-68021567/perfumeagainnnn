/* ==========================================================
   Body Scent — script.js (ใช้ร่วมกันทุกหน้า)
   ทำงานตาม element ที่มีอยู่ในหน้านั้นๆ
   หมายเหตุ: products.json โหลดด้วย fetch ต้องเปิดผ่านเซิร์ฟเวอร์
   (เช่น VS Code Live Server) ไม่ใช่ดับเบิลคลิกเปิดไฟล์ตรงๆ
   ========================================================== */

const STORAGE_KEY = "bodyScentOrders";

const MOODS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "fresh", label: "สดชื่น" },
  { key: "sweet", label: "หวานละมุน" },
  { key: "confident", label: "มั่นใจ" },
  { key: "romance", label: "โรแมนติก" },
];

/* ---------- Product page ---------- */
async function initProductPage() {
  const list = document.getElementById("product-list");
  const filterBar = document.getElementById("filter-bar");
  if (!list || !filterBar) return;

  let products = [];
  try {
    const res = await fetch("products.json");
    products = await res.json();
  } catch (err) {
    list.textContent = "โหลดข้อมูลสินค้าไม่สำเร็จ กรุณาเปิดผ่านเซิร์ฟเวอร์แล้วลองใหม่";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const validKeys = MOODS.map((m) => m.key);
  let current = validKeys.includes(params.get("mood")) ? params.get("mood") : "all";

  function renderFilters() {
    filterBar.innerHTML = "";
    MOODS.forEach((m) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = m.label;
      if (m.key !== "all") btn.dataset.mood = m.key;
      if (m.key === current) btn.classList.add("active");
      btn.addEventListener("click", () => {
        current = m.key;
        const url = m.key === "all" ? "product.html" : "product.html?mood=" + m.key;
        history.replaceState(null, "", url);
        renderFilters();
        renderProducts();
      });
      filterBar.appendChild(btn);
    });
  }

  function renderProducts() {
    const shown = current === "all" ? products : products.filter((p) => p.mood === current);
    list.innerHTML = "";

    shown.forEach((p) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.dataset.mood = p.mood;

      const img = document.createElement("img");
      img.src = p.image;
      img.alt = p.name;
      img.loading = "lazy";

      const body = document.createElement("div");
      body.className = "body";

      const title = document.createElement("h3");
      title.textContent = p.name;

      const desc = document.createElement("p");
      desc.textContent = p.description;

      const price = document.createElement("div");
      price.className = "price";
      price.textContent = p.price + " บาท";

      const link = document.createElement("a");
      link.className = "btn";
      link.textContent = "สั่งซื้อ";
      link.href =
        "order.html?item=" + encodeURIComponent(p.name) + "&price=" + encodeURIComponent(p.price);

      body.append(title, desc, price, link);
      card.append(img, body);
      list.appendChild(card);
    });
  }

  renderFilters();
  renderProducts();
}

/* ---------- Order page ---------- */
function initOrderPage() {
  const form = document.getElementById("orderForm");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const itemsEl = document.getElementById("items");
  const totalEl = document.getElementById("total");

  if (params.get("item")) itemsEl.value = params.get("item");
  if (params.get("price")) totalEl.value = params.get("price");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const order = {
      date: new Date().toISOString(),
      customerName: document.getElementById("customerName").value.trim(),
      contact: document.getElementById("contact").value.trim(),
      items: itemsEl.value,
      total: totalEl.value,
      note: document.getElementById("note").value.trim(),
    };

    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (err) {
      orders = [];
    }
    orders.push(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

    window.location.href = "thankyou.html";
  });
}

/* ---------- Admin page ---------- */
function initAdminPage() {
  const table = document.getElementById("ordersTable");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (err) {
    orders = [];
  }

  tbody.innerHTML = "";

  if (orders.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.textContent = "ยังไม่มีรายการสั่งซื้อ";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  orders
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((o) => {
      const tr = document.createElement("tr");
      const cells = [
        new Date(o.date).toLocaleString("th-TH"),
        o.customerName,
        o.contact,
        o.items,
        o.total ? o.total + " บาท" : "",
        o.note || "-",
      ];
      cells.forEach((text) => {
        const td = document.createElement("td");
        td.textContent = text;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  initProductPage();
  initOrderPage();
  initAdminPage();
});
