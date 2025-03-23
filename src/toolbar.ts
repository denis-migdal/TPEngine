import TPPage from "./TPPage";

const toolbar = document.createElement("span");
toolbar.classList.add("toolbar");

const import_btn = document.createElement('span');
import_btn.textContent = "[import]";
import_btn.addEventListener('click', () => {
    TPPage.import();
});

const export_btn = document.createElement('span');
export_btn.textContent = "[export]";
export_btn.addEventListener('click', async () => {
    TPPage.export();
});

toolbar.style.setProperty("position", "fixed");
toolbar.style.setProperty("bottom", "5px");
toolbar.style.setProperty("right", "5px");
toolbar.style.setProperty("cursor", "pointer");

toolbar.append(import_btn, export_btn);
document.body.append(toolbar);