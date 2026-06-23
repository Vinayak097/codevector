const productsContainer =
  document.getElementById("products");

const loadMoreBtn =
  document.getElementById("loadMore");

const categorySelect =
  document.getElementById("category");

let cursorUpdatedAt = null;
let cursorId = null;

const LIMIT = 20;

async function fetchProducts(reset = false) {
  try {
    let url = `/products?limit=${LIMIT}`;

    const category =
      categorySelect.value;

    if (category) {
      url += `&category=${encodeURIComponent(
        category
      )}`;
    }

    if (
      !reset &&
      cursorUpdatedAt &&
      cursorId
    ) {
      url += `&cursorUpdatedAt=${encodeURIComponent(
        cursorUpdatedAt
      )}`;

      url += `&cursorId=${cursorId}`;
    }

    const response =
      await fetch(url);

    const data =
      await response.json();

    if (reset) {
      productsContainer.innerHTML = "";
    }

    data.products.forEach((product) => {
      const card =
        document.createElement("div");

      card.className = "product";

      card.innerHTML = `
        <h3>${product.name}</h3>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Price:</strong> ₹${product.price}</p>
        <p><strong>Updated:</strong> ${new Date(
          product.updated_at
        ).toLocaleString()}</p>
      `;

      productsContainer.appendChild(card);
    });

    if (data.nextCursor) {
      cursorUpdatedAt =
        data.nextCursor.updatedAt;

      cursorId =
        data.nextCursor.id;
    } else {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent =
        "No More Products";
    }
  } catch (error) {
    console.error(error);
  }
}

loadMoreBtn.addEventListener(
  "click",
  () => {
    fetchProducts(false);
  }
);

categorySelect.addEventListener(
  "change",
  () => {
    cursorUpdatedAt = null;
    cursorId = null;

    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent =
      "Load More";

    fetchProducts(true);
  }
);

fetchProducts(true);