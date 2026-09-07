import { html, resolve } from "MWL@2026/exports/DOM";

export function createToolbar(
                                isDS: boolean,
                                callbacks: {
                                    onImport:() => void,
                                    onExport:() => void,
                                }) {
    const toolbarHTML = html( __LOAD_FILE__("./index.html") );
    document.body.append(toolbarHTML);

    const elems = resolve(document, {
        "importBtn": HTMLElement,
        "exportBtn": HTMLElement
    });

    if( isDS )
        elems.exportBtn.textContent = "Déposer";

    elems.importBtn.addEventListener("click", callbacks.onImport);
    elems.exportBtn.addEventListener("click", () => callbacks.onExport());
}