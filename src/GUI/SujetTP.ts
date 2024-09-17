import Rendu from "Rendu";
import { buffer2hex, hex2buffer } from "Utils";

// h4ck...
export const root_path = ["localhost", "127.0.0.1"].includes(location.hostname) ? "/dist/dev/pages/" : "/Cours/dist/dev/pages/";
const PAGE = window.location.pathname.slice( root_path.length, -1 ).replace("/TP/", "_");

const fields = [ ...document.querySelectorAll<HTMLElement>("[contenteditable]") ];

// INIT fields...
for(let i = 0; i < fields.length; ++i) {

    fields[i].addEventListener('input', () => {
        SUJET.updateAnswer(i, fields[i].textContent!);
    });
}

export default class SujetTP {

    #rendu: Rendu|null = null;

    constructor() {

        this.#rendu = new Rendu();

        const saved_data = localStorage.getItem(`answers:${PAGE}`);
        if(saved_data === null)
            return;

        (async () => {
            const content = hex2buffer(saved_data);
            this.rendu = await Rendu.loadFromArrayBuffer(content); // force update...
        })();
    }

    get filename() {
        return `${PAGE}.zip`;
    }

    get rendu() {
        return this.#rendu!;
    }

    set rendu(rendu: Rendu) {
        this.#rendu = rendu;

        this.#on_changes();
    }


    highlight(q_id: number) {

        document.querySelector(".answer_highlight")?.classList.remove("answer_highlight");

        const answer = fields[q_id];
        answer.classList.add('answer_highlight');

        const vh = document.documentElement.clientHeight;
        const ah = answer.clientHeight;

        document.querySelector("main")!.scrollTo({
            top: answer.offsetTop - (document.documentElement.clientHeight / 2 + ah / 2),
            behavior: "instant"
        })
        //TODO: scroll2middle...
    }

    updateAnswer(q_id: number, content: string) {
        this.#rendu!.getAnswer(q_id).text = content;
        this.#on_changes(false);
    }

    async #on_changes(update_fields: boolean = true) {
        const content  = buffer2hex( await this.#rendu!.toArrayBuffer() );
        localStorage.setItem(`answers:${PAGE}`, content );

        if( ! update_fields )
            return;

        // Update fields...
        for(let i = 0; i < fields.length; ++i) {

            const answer = this.#rendu!.getAnswer(i);

            fields[i].textContent = answer.text;
            fields[i].dispatchEvent( new CustomEvent("input") );

            fields[i].classList.remove('wrong', 'correct', 'comment');
            if( "grade" in answer )
                fields[i].classList.add( answer.grade === 1 ? "correct" : 'wrong');
            if( "comments" in answer ) {
                fields[i].classList.add('comments');
                fields[i].setAttribute('comments', answer.comments ?? "");
            }
        }
    }
}

/*

for(let i = 0; i < answers_fields.length; ++i ) {

    answers_fields[i].addEventListener('input', () => {
        const answer_txt = answers_fields[i].textContent!;
        
        //RENDU.getAnswer(i).text = answer_txt;

        //TODO...
        //localStorage.setItem(`answers:${PAGE}`, JSON.stringify(answers) );
    });
}
// init...

//TODO get real type...
let answers = answers_fields.map( e => { return { text: ""} } );

*/

export const SUJET = new SujetTP();