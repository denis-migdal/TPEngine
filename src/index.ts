const JSZip = require("jszip");

type Answer = {
    text: string,
    comments   ?: string,
    grade      ?: number,
    suspicious ?: boolean
};
type Rendu = {
    id  : string,
    name: string,
    filename: string,
    answers : Answer[]
}
type Rendus = Record<string, Rendu>;

import {decodeAnswers, encodeAnswers} from './tp.ts';

const answers_html = document.querySelector('#answers');
const qid_html = document.querySelector('#q_id')!;
const nbq_html = document.querySelector('#nb_q')!;

let data    : Rendus = {};
let filename: string = "";
let q_id = 0;
let nb_q = 0;


document.querySelector('#export_answers')!.addEventListener('click', async () => {

    const corrige_filename = filename.slice(0, -4) + "_c.zip";
    exportCorrige(corrige_filename, data);
});


document.querySelector('#import_answers')!.addEventListener('click', async () => {

    const file = await loadFromFile("*");
    filename = file.filename;

    const zip = new JSZip();
    await zip.loadAsync(file.content);

    for(let filename in zip.files) {

        //TODO: allows only one file...
        const fileparts = filename.split('/');

        if(fileparts[1].length === 0 ) // dunno why
            continue;

        let student_dir = fileparts[0];

        let parts = student_dir.split('_');

        const id   = parts[parts.length - 3];
        const name = parts.slice(0, parts.length - 4).join('_');

        const answer_file = await zip.file(filename).async("string");//"arraybuffer");
        const replies = decodeAnswers(answer_file);
        nb_q = replies.length - 1;

        data[id] = {
            id,
            name: name,
            answers : replies,
            filename: filename
        }
    }

    nbq_html.textContent = `${nb_q}`;
    q_id = 0;
    printAnswers(data, q_id);
});
// loadFromFile

async function exportCorrige(filename: string, corrige: Rendus) {

    //TODO build zip...
    const zip = new JSZip();
    for(let id in corrige) {
        zip.file(corrige[id].filename, encodeAnswers(corrige[id].answers) );
    }

    const content = await zip.generateAsync({type:"blob"});
    download( content, filename, ".zip");
}

function updateAnswers(answers: Answer[], fct: (answer: Answer) => void) {

    for(let answer of answers)
        fct(answer);

    localStorage.setItem("sav", JSON.stringify({data, filename}) );
}

const saved_data = localStorage.getItem("sav");
if(saved_data !== null) {
    const x = JSON.parse(saved_data);
    data     = x.data;
    filename = x.filename;

    nb_q = data[Object.keys(data)[0]].answers.length;

    nbq_html.textContent = `${nb_q}`;
    q_id = 0;
    printAnswers(data, q_id);
}

function printAnswers(answers: Rendus, q_id: number) {

    try {
        iframe.contentWindow?.postMessage(q_id);
    } catch(e) {}

    qid_html.textContent = `${q_id+1}`;

    let data: Record<string, Answer[]> = {};
    for(let s_id in answers) {
        const answer = answers[s_id].answers[q_id];
        (data[answer.text] ??= []).push( answer );
    }

    let sortedAnswers = Object.keys(data).sort( (a,b) => a.localeCompare(b) );

    let answerlist_html = [];
    for(let answer of sortedAnswers) {

        let answer_status = "";
        if( answer === "")
            answer_status = " wrong";

        if( data[answer][0].grade === 0 )
            answer_status = " wrong";
        if( data[answer][0].grade === 1 )
            answer_status = " correct";

        let sus_status = "";
        if( data[answer][0].suspicious === true)
            sus_status = " suspicious";

        let comment = data[answer][0].comments ?? "";

        const answer_html = str2html( //TODO: use LISS...
`<div class="answer${ answer_status }${sus_status}">
    <div class="opts"><span class="ok">[O]</span><span class="nok">[X]</span><span class="sus">[S]</span><br/>(${ data[answer].length })</div>
    <div class="field">
        <div class="text">${answer}</div>
        <input class="comment" value="${comment}" />
    </div>
</div>`);
        
        // not optimal but osef
        answer_html.querySelector(".opts > .ok")!.addEventListener('click', () => {
            answer_html.classList.add('correct');
            answer_html.classList.remove('wrong');

            updateAnswers( data[answer], (a) => { a.grade = 1; } )
        });
        answer_html.querySelector(".opts > .nok")!.addEventListener('click', () => {
            answer_html.classList.add('wrong');
            answer_html.classList.remove('correct');

            updateAnswers( data[answer], (a) => { a.grade = 0; } )
        });
        answer_html.querySelector(".opts > .sus")!.addEventListener('click', () => {
            const sus = answer_html.classList.toggle('suspicious');
            updateAnswers( data[answer], (a) => { a.suspicious = sus; } );
        });
        const comment_html = answer_html.querySelector<HTMLInputElement>(".comment")!;
        comment_html.addEventListener('input', () => {
            updateAnswers( data[answer], (a) => { a.comments = comment_html.value; } );
        });

        answerlist_html.push( answer_html );
    }

    answers_html?.replaceChildren(...answerlist_html);

}

function setSujet(url: string) {
    iframe.src = url;

    localStorage.setItem("TPEngine.sujet", url);
}

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
    
    if(q_id <= 0)
        return;

    printAnswers(data, --q_id);
});
document.querySelector('#next')!.addEventListener("click", () => {
    
    if(q_id+1 >= nb_q)
        return;

    printAnswers(data, ++q_id);
});

// Download

// better : https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/downloads/download

// https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
// Function to download data to a file
export function download(data:ArrayBuffer|string, filename: string, type:string) {
    var file = new Blob([data], {type: type});
    if ('msSaveOrOpenBlob' in window.navigator) // IE10+
        (window.navigator as any).msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

// load...
import { str2html } from "str2html";
export async function loadFromFile(src: string) {

	if( ! window )
		throw new Error('Can\'t use Browser load outside of a Browser!');

	document.querySelector('#file-selector')?.remove(); // lazy remove (can't detect cancel event)

	let input = str2html<HTMLInputElement>(`<input type="file" id="file-selector" style='display:none' accept="${src}">`);
	document.body.append(input);

	let p = new Promise( (r) => {

		input.addEventListener('change', (event: any) => {
			
			let file = event.target.files[0];
			let filename = file.name;

    		const reader = new FileReader();
			reader.addEventListener('load', (event: any) => {
				input.remove();
				r([filename, event.target.result]);
			});
			reader.readAsArrayBuffer(file);
		});
		input.click();
	});

	let [filename, content] = ((await p) as [filename: string, data: ArrayBuffer]);

	input.remove();

	return {
		filename,
		content
	}
}