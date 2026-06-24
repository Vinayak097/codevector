const productsContainer = document.getElementById("products");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageNumbersEl = document.getElementById("pageNumbers");
const categorySelect = document.getElementById("category");
const limitSelect = document.getElementById("limit");
const statusEl = document.getElementById("status");
const loadedCountEl = document.getElementById("loadedCount");
const cursorTextEl = document.getElementById("cursorText");

// Backend URL is set by config.js (loaded before this script)
const API_BASE = window.REACT_APP_BACKEND_URL || "http://localhost:8000";

let pageCursors = [null];
let currentPageIndex = 0;
let currentPageCount = 0;
let reachedEnd = false;
let isLoading = false;

function setStatus(text) {
  statusEl.textContent = text;
}

function updateSummary() {
  loadedCountEl.textContent = `Page ${currentPageIndex + 1}`;
  cursorTextEl.textContent = `${currentPageCount} product${currentPageCount === 1 ? "" : "s"} shown`;
}

function resetState() {
  pageCursors = [null];
  currentPageIndex = 0;
  currentPageCount = 0;
  reachedEnd = false;
  productsContainer.innerHTML = "";
  updateSummary();
  updatePagination();
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

function renderProducts(products) {
  productsContainer.innerHTML = "";
  products.forEach(renderProduct);
}

function buildUrl(pageIndex) {
  const params = new URLSearchParams({
    limit: limitSelect.value,
  });

  if (categorySelect.value) {
    params.set("category", categorySelect.value);
  }

  const cursor = pageCursors[pageIndex];

  if (cursor) {
    params.set("cursorUpdatedAt", cursor.updatedAt);
    params.set("cursorId", cursor.id);
  }

  return `${API_BASE}/products?${params.toString()}`;
}

function getVisiblePageIndexes() {
  const lastIndex = pageCursors.length - 1;
  const indexes = new Set([
    0,
    lastIndex,
    currentPageIndex - 2,
    currentPageIndex - 1,
    currentPageIndex,
    currentPageIndex + 1,
    currentPageIndex + 2,
  ]);

  return [...indexes]
    .filter((index) => index >= 0 && index <= lastIndex)
    .sort((a, b) => a - b);
}

function renderPageNumbers() {
  pageNumbersEl.innerHTML = "";

  const visiblePages = getVisiblePageIndexes();
  let previousIndex = null;

  visiblePages.forEach((pageIndex) => {
    if (previousIndex !== null && pageIndex - previousIndex > 1) {
      const dots = document.createElement("span");
      dots.className = "page-dots";
      dots.textContent = "...";
      pageNumbersEl.appendChild(dots);
    }

    const pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.className = "page-number";
    pageButton.textContent = String(pageIndex + 1);
    pageButton.disabled = isLoading || pageIndex === currentPageIndex;

    if (pageIndex === currentPageIndex) {
      pageButton.setAttribute("aria-current", "page");
    }

    pageButton.addEventListener("click", () => {
      fetchPage(pageIndex);
    });

    pageNumbersEl.appendChild(pageButton);
    previousIndex = pageIndex;
  });
}

function updatePagination() {
  prevPageBtn.disabled = isLoading || currentPageIndex === 0;
  nextPageBtn.disabled =
    isLoading || reachedEnd || !pageCursors[currentPageIndex + 1];
  nextPageBtn.textContent = reachedEnd ? "Last Page" : "Next";
  renderPageNumbers();
}

function saveNextCursor(pageIndex, nextCursor, productsLength) {
  if (nextCursor && productsLength > 0) {
    pageCursors[pageIndex + 1] = nextCursor;
    reachedEnd = false;
    return;
  }

  pageCursors.length = pageIndex + 1;
  reachedEnd = true;
}

async function fetchPage(pageIndex) {
  if (isLoading || pageIndex < 0 || !pageCursors[pageIndex]) {
    if (pageIndex !== 0) {
      return;
    }
  }

  isLoading = true;
  setStatus("Loading");
  updatePagination();

  try {
    const response = await fetch(buildUrl(pageIndex));

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    if (products.length === 0) {
      if (pageIndex === 0) {
        currentPageIndex = 0;
        currentPageCount = 0;
        reachedEnd = true;
        pageCursors = [null];
        showMessage("No products found for this filter.");
      } else {
        pageCursors.length = pageIndex;
        reachedEnd = true;
        setStatus("Complete");
      }

      updateSummary();
      return;
    }

    renderProducts(products);
    currentPageIndex = pageIndex;
    currentPageCount = products.length;
    saveNextCursor(pageIndex, data.nextCursor, products.length);
    setStatus("Ready");
    updateSummary();
  } catch (error) {
    console.error(error);

    if (currentPageCount === 0) {
      showMessage(
        "Could not load products. Start the backend server, then try again.",
        "error"
      );
    }

    setStatus("Error");
  } finally {
    isLoading = false;
    updatePagination();
  }
}

prevPageBtn.addEventListener("click", () => {
  fetchPage(currentPageIndex - 1);
});

nextPageBtn.addEventListener("click", () => {
  fetchPage(currentPageIndex + 1);
});

categorySelect.addEventListener("change", () => {
  resetState();
  fetchPage(0);
});

limitSelect.addEventListener("change", () => {
  resetState();
  fetchPage(0);
});

resetState();
fetchPage(0);
