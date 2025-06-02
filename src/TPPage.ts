import whenDOMContentLoaded from "@LISS/src/utils/DOM/whenDOMContentLoaded";

import "@TPEngine/Questions/QText";
import "@TPEngine/Questions/QMultiText";
import { getSignal } from "@LISS/src/LISSClasses/LISSValue";
import FileManager, { FileManagerOpts } from "./structs/FileManager";
import { Answer, Answers, AnswersConv } from "./structs/Answers";

const p = new URLSearchParams(location.search);

let place = p.get('place');
let ds_id = p.get('ds');

if( ds_id !== null && place === null ) {
    place = prompt('Entrez votre n° de place (e.g. S15-1A)')!.toUpperCase();
    history.pushState({}, "", `${location.search}&place=${place}`);
}

class TPPage implements FileManagerOpts<Answers> {

    readonly extension = ".answers";
    readonly converter = AnswersConv;
    readonly localStorage_name = location.pathname;

    get export_filename() {

        // else...
        // location.pathname.slice(1,-1).replaceAll("/", "_") + ".answers";

        return `${ds_id}_${location.hostname}_${place}.answers`
    }

    readonly #data = new FileManager(this);

    constructor() {

        this.#initGUI(); //TODO...

        this.#data.listen( () => {
            this.#updateFieldsFromAnswer();
        })
    }

    #elems  = [...document.querySelectorAll<HTMLElement>("*")]
                          .filter( t => t.tagName.startsWith("Q-") )
    #fields = this.#elems .map   ( e => getSignal<Answer>(e, { answer: {} }) );

    #updateFieldsFromAnswer() {

        const value = this.#data.content.value;
        if( value === null)
            return;

        for(let i = 0; i < this.#fields.length; ++i)
            this.#fields[i].value = value[i] ?? null;
    }

    #updateAnswerFromField(id: number) {

        let value = this.#data.content.value;

        if( value === null ) {
            if( this.#fields[id].value !== null)
                return;
            value = this.#data.content.value = new Array(this.#fields.length);
        }

        // force update
        // with not working if out of index.
        const val = [...value];
        val[id] = this.#fields[id].value ?? {};

        this.#data.content.value = val;
    }

    #initGUI() {

        const toolbar = document.createElement("span");
        toolbar.classList.add("toolbar");

        const import_btn = document.createElement('span');
        import_btn.textContent = "[import]";
        import_btn.addEventListener('click', () => {
            this.#data.import();
        });

        const export_btn = document.createElement('span');
        export_btn.textContent = "[export]";
        export_btn.addEventListener('click', async () => {
            this.#data.export();
        });

        toolbar.style.setProperty("position", "fixed");
        toolbar.style.setProperty("bottom", "5px");
        toolbar.style.setProperty("right", "5px");
        toolbar.style.setProperty("cursor", "pointer");

        toolbar.append(import_btn, export_btn);
        document.body.append(toolbar);

        for(let i = 0; i < this.#fields.length; ++i)
            this.#fields[i].listen( () => this.#updateAnswerFromField(i) );

        addEventListener("message", (e) => {

            if( typeof e.data === "string" )
                return; // setImmediate junk.

            if( e.data.type === "corrige" ) {
                this.#data.loadFromBuffer( e.data.value, null );

                // replies with q types...
                window.parent.postMessage({
                    type: "questions",
                    value: this.#elems.map( e => {
                        return {
                            type: e.tagName.toLocaleUpperCase().slice(2)
                        }
                    }
                )},"*");

                return;
            }
            if( e.data.type === "highlight" ) {
                this.#highlight(e.data.value);
                return;
            }
        })
    }

    #highlight(q_id: number) {

        document.querySelector(".answer_highlight")?.classList.remove("answer_highlight");

        const answer = this.#elems[q_id];
        answer.classList.add('answer_highlight');

        const vh = document.documentElement.clientHeight;
        const ah = answer.clientHeight;

        document.querySelector("main")!.scrollTo({
            top: answer.offsetTop - (document.documentElement.clientHeight / 2 + ah / 2),
            behavior: "instant"
        });
    }

}

// ensure the DOM is ready before searching for questions
await whenDOMContentLoaded();

export default new TPPage();

/*
export default class SujetTP {

    async #on_changes(update_fields: boolean = true) {
        const content  = buffer2hex( await this.#rendu!.toArrayBuffer() );
        localStorage.setItem(`answers:${PAGE}`, content );

        if( ! update_fields )
            return;

        // Update fields...
        for(let i = 0; i < fields.length; ++i) {

            const answer = this.#rendu!.getAnswer(i);

            fields[i].innerText = answer.text;
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
*/