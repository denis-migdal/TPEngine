//TODO: load... + save...

const decoder = new TextDecoder();
export function decodeAnswers(content: string) {

    let text = content;

    if( text[0] !== '[') {
        //btoa
        text = atob(text)
    }

    if( text[0] !== '[')
        text = decoder.decode( Uint8Array.from( text.match(/.{2}/g)!.map(e => parseInt(e, 16)) ) );

    const data = JSON.parse(text);

    for(let i = 0; i < data.length; ++i) {
        if( data[i] === null )
            data[i] = "";
        if(typeof data[i] === 'string')
            data[i] = {
                text: data[i] ?? ""
            };
    }

    return data;
}

const encoder = new TextEncoder();
export function encodeAnswers(answers: any) {

    return JSON.stringify(answers, null, '\t');

    /*
     const json = JSON.stringify(answers):
    const encoded = encoder.encode(json);

    const hex = [...encoded].map(
        n => {
            return n.toString(16).padStart(2, "0")
        }
    ).join('');

    return btoa(hex);*/
}

/*
const PAGE = window.location.pathname.split('/').slice(-1)[0].split('.')[0];

const inputs = document.querySelectorAll(":is(input,textarea):not(.example)");

let answers = new Array(inputs.length+1);

for(let i = 0; i < inputs.length; ++i) {

    const input = inputs[i];

    input.addEventListener('input', () => {
        const answer = input.value
        answers[i] = answer;
        localStorage.setItem(`${PAGE}.answers.${i}`, answer)
    });

    const answer = localStorage.getItem(`${PAGE}.answers.${i}`);
    input.value = answer;
    answers[i] = answer;
}

const params = new URLSearchParams(location.search);

//TODO...
answers[answers.length-1] = params.get("id") + "-" + params.get("numid");

const export_btn = document.createElement("button");
export_btn.textContent = "Export";
export_btn.setAttribute('id', "export_btn");

function download(data, filename, type) {
    const file = new Blob([data], {type});
    const a   = document.createElement("a");
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
}




export_btn.addEventListener("click", () => {

    download(toHex(answers), `${PAGE}.answers`);
});

function saveAnswers() {
    for(let i = 0; i < answers.length; ++i) {
        localStorage.setItem(`${PAGE}.answers.${i}`, answers[i])
    }
}

let toolbar = document.createElement('div');
toolbar.setAttribute('id', 'toolbar');

const file_upload = document.createElement('input');
file_upload.setAttribute('type', 'file');

const import_btn = document.createElement('button');
import_btn.addEventListener('click', () => {
    file_upload.click();
});
import_btn.textContent = 'Import';


file_upload.addEventListener('change', async () => {
    
    let text = await file_upload.files[0].text();
    if( text[0] !== '[') {
        //btoa
        text = atob(text)
    }

    if( text[0] !== '[') {

        text = Uint8Array.from( text.match(/.{2}/g).map(e => parseInt(e, 16)) );
        text = decoder.decode(text);
    }

    console.log(text);
    answers = JSON.parse(text);

    for(let i = 0; i < inputs.length; ++i) {
        inputs[i].value = answers[i];
    }


    //TODO: 3 steps...
});

toolbar.append(export_btn, import_btn);


document.body.append(toolbar);*/