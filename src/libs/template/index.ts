import { html } from "MWL@2026:exports/DOM";
import { listen } from "MWL@2026:exports/Reactive/Events";
import BrowserFile from "TPEngine@2026:core/DataStore/BrowserFile";
import { QuestionElement, SubjectPage } from "TPEngine@2026:core/Subject/SubjectPage";

const p = new URLSearchParams(location.search);

/////
// DS mode
/////

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
// Corrigé
/////


const cpwd = p.get("cpwd");
if( cpwd !== null ) {

    const file = `${location.origin}${location.pathname}/assets/answers.enc`;
    const encrypted = await (await fetch(file)).arrayBuffer();
    
    function hexToBytes(hex: string): ArrayBuffer {
        return new Uint8Array(
            hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
        ).buffer;
    }

    const iv = encrypted.slice(0, 12);
    const ciphertext = encrypted.slice(12);

    const key = await crypto.subtle.importKey(
        "raw",
        hexToBytes(cpwd),
        {
            name: "AES-GCM",
        },
        false,
        ["decrypt"],
    );

    const decrypted = await crypto.subtle.decrypt({
            name: "AES-GCM",
            iv,
        },
        key,
        ciphertext,
    );

    subject.openCorrection(decrypted);
}

/////
// Import/Export
/////

const toolbar = html`<span class='TPEngine-toolbar'></span>`;

const importBtn = html`<span>[Importer]</span>`;
const exportBtn = html`<span>[${isDS ? "Déposer" : "Exporter"}]</span>`;

toolbar.append(importBtn, exportBtn);
document.body.append(toolbar);

const file = new BrowserFile(subject.studentWork, FILE_EXT, EXPORT_FILENAME);
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
    listen(subject.studentWork, async () => {

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