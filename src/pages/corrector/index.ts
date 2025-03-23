import Rendus from '@TPEngine/Rendus';
import AnswersBrowser from "@TPEngine/AnswersBrowser";

import { upload } from '@TPEngine/utils/upload';
import { download } from '@TPEngine/utils/download';

let ansBrowser = new AnswersBrowser();

console.warn("here");

document.querySelector('#export_answers')!.addEventListener('click', async () => {

    if( ansBrowser.rendus === null )
        return;

    // pour moodle...
    const filename = ansBrowser.rendus.filename.slice(0, -4) + "_c.zip";
    const content  = await ansBrowser.rendus.toArrayBuffer();

    download( content, filename, ".zip");
});

document.querySelector('#export_csv')!.addEventListener('click', async () => {

    //Odin : NUMERO|NOTE|INFOSJURY.
    if( ansBrowser.rendus === null )
        return;

    const rendus = ansBrowser.rendus;

    const lines = Object.values(rendus.data).map( ({student_id, student_name, rendu}) => {

        let data: string[] = [];
        let count = 0;
        for(let i = 0; i < rendu.nbQuestions; ++i) {
            const answer = rendu.getAnswer(i);
            count += answer.grade ?? 0;
            let comment = answer.comments ?? "";
            if( comment.length )
                comment = `"${comment.replaceAll('"', '""')}"`;
            data.push( (answer.grade ?? 0) + "\t" + (answer.suspicious??"") + "\t" + comment );
        }
        return [student_name, student_id, count, "", ...data].join('\t');
    }).join('\n');

    download( lines , rendus.filename + ".csv", ".csv");

});

document.querySelector('#import_answers')!.addEventListener('click', async () => {

    const file = (await upload(".zip"))!;

	const filename = file.name;
    const data     = await file!.arrayBuffer();

    const rendus = await Rendus.loadFromArrayBuffer(filename, data);

    //TODO...
    ansBrowser.rendus = rendus;
});

function setSujet(url: string) {
    iframe.src = url;

    localStorage.setItem("TPEngine.sujet", url);
}

function studentList(): string[] {
    return [...document.querySelectorAll<HTMLInputElement>("#filter .students input")]
            .filter(e => e.checked)
            .map( e => (e as any).student);
}

const checkAll = document.querySelector<HTMLInputElement>("#filter > div > input")!;
checkAll!.addEventListener('click', () => {
    for(let elem of document.querySelectorAll<HTMLInputElement>("#filter .students input") )
        elem.checked = checkAll.checked;

    ansBrowser.filter = studentList();
});

document.querySelector("#filter .students")!.addEventListener("click", (ev) => {
    const target = ev.target! as HTMLElement;
    if(target.tagName !== "INPUT")
        return;

    console.warn( (target as any).student );

    ansBrowser.filter = studentList();
});

//TODO: update...

const iframe = document.querySelector('iframe')!
document.querySelector('#load_subject')!.addEventListener('click', () => {

    const url = prompt("Enter subject URL", "/src/sujet.html");
    if(url === null)
        return;

    setSujet(url);
});

const params = new URLSearchParams( window.location.search );
if( params.has("sujet") )
    setSujet(params.get("sujet")! );
else if( localStorage.getItem("TPEngine.sujet") !== null )
    setSujet( localStorage.getItem("TPEngine.sujet")! );

document.querySelector('#prev')!.addEventListener("click", () => {
    ansBrowser.prev_question();
});
document.querySelector('#next')!.addEventListener("click", () => {
    ansBrowser.next_question();
});