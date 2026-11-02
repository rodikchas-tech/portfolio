/* ---------- Адрес сервера ----------
   Сюда впиши адрес своего сервера на PythonAnywhere, с /send на конце.
   Пример: https://rodion123.pythonanywhere.com/send */
const SERVER_URL = "https://pochtisolewae.pythonanywhere.com/send";

/* ---------- Проекты и фильтры ---------- */
const list = document.getElementById("project-list");
const filters = document.getElementById("filters");
let activeCategory = "Все";

// Маленький помощник: создаёт элемент с классом и текстом
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderFilters() {
  const categories = [...new Set(PROJECTS.map(p => p.category))];

  // Одна категория: фильтр не нужен, прячем
  if (categories.length < 2) {
    filters.hidden = true;
    return;
  }

  filters.hidden = false;
  filters.innerHTML = "";

  ["Все", ...categories].forEach(category => {
    const button = el("button", "filter", category);
    button.type = "button";
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      renderFilters();
      renderProjects();
    });
    filters.appendChild(button);
  });
}

function renderProjects() {
  list.innerHTML = "";

  const visible = PROJECTS.filter(
    p => activeCategory === "Все" || p.category === activeCategory
  );

  visible.forEach(project => {
    const item = el("li", "project");

    const info = el("div", "info");
    info.appendChild(el("h3", "", project.title));
    info.appendChild(el("p", "desc", project.description));

    const tags = el("ul", "tags");
    project.tags.forEach(tag => tags.appendChild(el("li", "", tag)));
    info.appendChild(tags);

    if (project.link) {
      const link = el("a", "project-link", project.linkText || "Открыть");
      link.href = project.link;
      link.target = "_blank";
      link.rel = "noopener";
      info.appendChild(link);
    }

    const thumb = el("div", "thumb");
    if (project.image) {
      const img = document.createElement("img");
      img.src = project.image;
      img.alt = "Превью проекта " + project.title;
      img.loading = "lazy";
      // Нет файла картинки: убираем её, остаётся тёмная заглушка
      img.addEventListener("error", () => img.remove());
      thumb.appendChild(img);
    }

    item.appendChild(info);
    item.appendChild(thumb);
    list.appendChild(item);
  });
}

renderFilters();
renderProjects();

/* ---------- Форма ---------- */
const form = document.getElementById("contact-form");
const statusBox = document.getElementById("form-status");
const submitButton = form.querySelector("button[type='submit']");

function setStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = "form-status" + (type ? " " + type : "");
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const data = new FormData(form);
  const name = data.get("name").trim();
  const contact = data.get("contact").trim();
  const message = data.get("message").trim();

  if (!name || !contact || !message) {
    setStatus("Заполните все три поля.", "error");
    return;
  }

  // Пока адрес сервера не вписан, работаем как демо-форма
  if (SERVER_URL.includes("ИМЯ")) {
    setStatus("Форма пока в демо-режиме: сообщение никуда не отправлено.", "");
    return;
  }

  submitButton.disabled = true;
  setStatus("Отправляю...", "");

  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: "portfolio", name: name, contact: contact, message: message })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      setStatus(result.error || "Не удалось отправить. Попробуйте ещё раз чуть позже.", "error");
      return;
    }

    form.reset();
    setStatus("Сообщение отправлено. Отвечу, как только увижу.", "ok");
  } catch (error) {
    console.error(error);
    setStatus("Нет связи с сервером. Попробуйте ещё раз чуть позже.", "error");
  } finally {
    submitButton.disabled = false;
  }
});