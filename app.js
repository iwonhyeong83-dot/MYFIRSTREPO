const elements = {
  input: document.querySelector("#searchInput"),
  clear: document.querySelector("#clearButton"),
  count: document.querySelector("#resultCount"),
  results: document.querySelector("#results"),
  empty: document.querySelector("#emptyState"),
  error: document.querySelector("#errorState"),
};

let articles = [];

const normalizeForSearch = (value = "") =>
  value.toLocaleLowerCase("ko-KR").replace(/\s+/g, "");

const escapeHtml = (value = "") =>
  value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char]);

const highlight = (text, keyword) => {
  if (!keyword.trim()) return escapeHtml(text);
  const safeText = escapeHtml(text);
  const safeKeyword = escapeHtml(keyword.trim()).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safeText.replace(new RegExp(`(${safeKeyword})`, "giu"), "<mark>$1</mark>");
};

const render = () => {
  const keyword = elements.input.value.trim();
  const normalizedKeyword = normalizeForSearch(keyword);
  const visible = normalizedKeyword
    ? articles.filter((article) => normalizeForSearch(article.본문).includes(normalizedKeyword))
    : articles;

  elements.results.innerHTML = visible.map((article) => `
    <article class="article-card">
      <header class="card-head">
        <span class="article-number">${escapeHtml(article.조)}</span>
        <h2 class="article-title">${escapeHtml(article.제목)}</h2>
        <span class="category ${article.구분 === "부칙" ? "addendum" : ""}">${escapeHtml(article.구분)}</span>
      </header>
      <p class="article-body">${highlight(article.본문, keyword)}</p>
    </article>
  `).join("");

  elements.count.textContent = `결과 ${visible.length}건`;
  elements.clear.hidden = !keyword;
  elements.empty.hidden = visible.length !== 0;
  elements.results.setAttribute("aria-busy", "false");
};

const loadArticles = async () => {
  try {
    const response = await fetch("./조항데이터.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("조항데이터.json은 배열이어야 합니다.");
    articles = data;
    render();
  } catch (error) {
    console.error(error);
    elements.results.setAttribute("aria-busy", "false");
    elements.error.hidden = false;
    elements.count.textContent = "결과 0건";
  }
};

elements.input.addEventListener("input", render);
elements.clear.addEventListener("click", () => {
  elements.input.value = "";
  elements.input.focus();
  render();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== elements.input) {
    event.preventDefault();
    elements.input.focus();
  }
});

loadArticles();
