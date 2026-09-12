import { StudentWorkCodec } from "TPEngine@2026/ports/codecs/StudentWork";

export function loadConfig() {

    const subjectID = location.pathname;

    const p = new URLSearchParams(location.search);
    const isDS = p.get('ds') !== null;
    const isInCorrector = window !== window.parent;

    let student: string|null = null;
    let subjectName = location.pathname.slice(1,-1).replaceAll("/", "_");

    if( isDS ) {
        student = askStudentName(p);
        subjectName = `${location.hostname}_${student}`;
    }

    let solution = getSolution(p);

    return {
        subjectID,
        isDS,
        isInCorrector,
        student,
        subjectName,
        solution,
    }
}

function askStudentName(p: URLSearchParams) {

    let name = p.get('nom');
    if( name !== null )
        return name;

    do {
        name = prompt('Entrez votre nom sous la forme "NOM Prénom"');
    } while( name === null);

    name = name.toUpperCase();
    history.pushState({}, "", `${location.search}&nom=${name}`);

    return name;
}

function getSolution(p: URLSearchParams) {

    const cpwd = p.get("cpwd");

    console.warn("soluce", cpwd);

    if( cpwd === null )
        return null;

    return loadSolution(cpwd);
}

async function loadSolution(cpwd: string) {

    const file = `${location.origin}${location.pathname}/assets/answers.enc`;
    const encrypted = await (await fetch(file)).arrayBuffer();
    
    const decrypted = await decrypt(encrypted, cpwd);

    console.warn("solution");

    return StudentWorkCodec.decode(decrypted);
}

async function decrypt(encrypted: ArrayBuffer, cpwd: string) {

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

    return await crypto.subtle.decrypt({
            name: "AES-GCM",
            iv,
        },
        key,
        ciphertext,
    );
}

function hexToBytes(hex: string): ArrayBuffer {
    return new Uint8Array(
        hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
    ).buffer;
}