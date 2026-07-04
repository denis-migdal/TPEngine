import html from "MWL@2026:DOM/ShadowTemplate/parsers/html";
import { observeChanges } from "MWL@2026:Reactive/Observers/observe";
import BrowserFile from "TPEngine@2026:DataStore/BrowserFile";
import { QuestionElement, SubjectPage } from "TPEngine@2026:SubjectPage";

/////
// DS mode
/////

const p = new URLSearchParams(location.search);

let student = p.get('nom');
let isDS = p.get('ds') !== null;

if( isDS && student === null ) {
    student = prompt('Entrez votre nom sous la forme "NOM Prénom"')!.toUpperCase();
    history.pushState({}, "", `${location.search}&nom=${student}`);
}

const FILE_EXT = ".answers";
const EXPORT_FILENAME = isDS ? `${location.hostname}_${student}${FILE_EXT}`
                             : `${location.pathname.slice(1,-1).replaceAll("/", "_")}${FILE_EXT}`;

//////

function getQuestions() {
    return [...document.querySelectorAll<QuestionElement>("*")]
                .filter( t => t.localName.startsWith("q-") );
}

const subject = new SubjectPage( getQuestions() );

/////
// Import/Export
/////

const toolbar = html`<span class='TPEngine-toolbar'></span>`;

const importBtn = html`<span>[Importer]</span>`;
const exportBtn = html`<span>[${isDS ? "Déposer" : "Exporter"}]</span>`;

toolbar.append(importBtn, exportBtn);
document.body.append(toolbar);

const file = new BrowserFile(subject.studentWork, ".answer", EXPORT_FILENAME);
importBtn.addEventListener("click", () => file.load() );

async function exporter() {
    if( ! isDS ) {
        await file.save();
        return;
    }

    if( ! confirm(`${student}\nÊtes vous sur de vouloir rendre ?`) )
        return;

    const buffer = await subject.studentWork.export();

    await fetch(`${location.origin}/submit?name=${student}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
        },
        body: buffer
    });
}

exportBtn.addEventListener("click", exporter);

// auto-save into a file (easier to manage in case of issue during DS).

if( isDS) {
    observeChanges(subject.studentWork, async () => {

        const buffer = await subject.studentWork.export();

        await fetch(`${location.origin}/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream",
            },
            body: buffer
        });
    });
}