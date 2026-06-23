const productsContainer = document.getElementById("products");
const loadMoreBtn = document.getElementById("loadMore");
const categorySelect = document.getElementById("category");
const limitSelect = document.getElementById("limit");
const statusEl = document.getElementById("status");
const loadedCountEl = document.getElementById("loadedCount");
const cursorTextEl = document.getElementById("cursorText");

const API_BASE ="http://localhost:8000"

let cursorUpdatedAt = null;
let cursorId = null;
let loadedCount = 0;
let isLoading = false;

function setStatus(text) {
  statusEl.textContent = text;
}

function setButton(text, disabled) {
  loadMoreBtn.textContent = text;
  loadMoreBtn.disabled = disabled;
}

function updateSummary() {
  loadedCountEl.textContent = `${loadedCount} product${loadedCount === 1 ? "" : "s"} loaded`;
  cursorTextEl.textContent = cursorId ? `Cursor ID ${cursorId}` : "First page";
}

function resetState() {
  cursorUpdatedAt = null;
  cursorId = null;
  loadedCount = 0;
  productsContainer.innerHTML = "";
  updateSummary();
}

function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "INR 0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function showMessage(text, type = "empty") {
  productsContainer.innerHTML = "";

  const message = document.createElement("div");
  message.className = type === "error" ? "message error" : "message";
  message.textContent = text;

  productsContainer.appendChild(message);
}

function addDefinition(list, label, value) {
  const term = document.createElement("dt");
  term.textContent = label;

  const description = document.createElement("dd");
  description.textContent = value;

  list.append(term, description);
}

function renderProduct(product) {
  const card = document.createElement("article");
  card.className = "product";

  const title = document.createElement("h2");
  title.textContent = product.name ?? "Unnamed product";

  const badges = document.createElement("div");
  badges.className = "badges";

  const category = document.createElement("span");
  category.className = "badge";
  category.textContent = product.category ?? "Uncategorized";

  const id = document.createElement("span");
  id.className = "badge";
  id.textContent = `#${product.id ?? "-"}`;

  badges.append(category, id);

  const details = document.createElement("dl");
  addDefinition(details, "Price", formatPrice(product.price));
  addDefinition(details, "Created", formatDate(product.created_at));
  addDefinition(details, "Updated", formatDate(product.updated_at));

  card.append(title, badges, details);
  productsContainer.appendChild(card);
}

function buildUrl(reset) {
  const params = new URLSearchParams({
    limit: limitSelect.value,
  });

  if (categorySelect.value) {
    params.set("category", categorySelect.value);
  }

  if (!reset && cursorUpdatedAt && cursorId) {
    params.set("cursorUpdatedAt", cursorUpdatedAt);
    params.set("cursorId", cursorId);
  }

  return `${API_BASE}/products?${params.toString()}`;
}

async function fetchProducts(reset = false) {
  if (isLoading) {
    return;
  }

  if (reset) {
    resetState();
  }

  isLoading = true;
  setStatus("Loading");
  setButton("Loading...", true);

  try {
    const response = await fetch(buildUrl(reset));

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    if (products.length === 0 && loadedCount === 0) {
      showMessage("No products found for this filter.");
    } else {
      products.forEach(renderProduct);
    }

    loadedCount += products.length;

    if (data.nextCursor && products.length > 0) {
      cursorUpdatedAt = data.nextCursor.updatedAt;
      cursorId = data.nextCursor.id;
      setButton("Load More", false);
      setStatus("Ready");
    } else {
      cursorUpdatedAt = null;
      cursorId = null;
      setButton("No More Products", true);
      setStatus("Complete");
    }

    updateSummary();
  } catch (error) {
    console.error(error);

    if (loadedCount === 0) {
      showMessage(
        "Could not load products. Start the backend server, then try again.",
        "error"
      );
    }

    setStatus("Error");
    setButton("Try Again", false);
  } finally {
    isLoading = false;
  }
}

loadMoreBtn.addEventListener("click", () => {
  fetchProducts(false);
});

categorySelect.addEventListener("change", () => {
  fetchProducts(true);
});

limitSelect.addEventListener("change", () => {
  fetchProducts(true);
});

updateSummary();
fetchProducts(true);
