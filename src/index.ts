import Rendus from './Rendus.ts';
import AnswersBrowser from "./GUI/AnswersBrowser.ts";

let ansBrowser = new AnswersBrowser();

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

    const file = await loadFromFile(".zip");
    ansBrowser.rendus = await Rendus.loadFromArrayBuffer(file.filename, file.content);
});


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
    ansBrowser.prev_question();
});
document.querySelector('#next')!.addEventListener("click", () => {
    ansBrowser.next_question();
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
import { str2html } from "./Utils/str2html";
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