import { download } from "@TPEngine/utils/download";
import { upload }   from "@TPEngine//utils/upload";

import whenDOMContentLoaded from "@LISS/src/utils/DOM/whenDOMContentLoaded";

import "@TPEngine/Questions/QText";
import "@TPEngine/Questions/QMultiText";
import { getSignal } from "@LISS/src/LISSClasses/LISSValue";
import { buildEmptyQuestion } from "@TPEngine/Questions/QText";
import Rendu from "./Rendu";
import { str2buffer } from "./utils/buffer";

class TPPage {

    #id     = location.pathname;
    #export = this.#id.slice(1,-1).replaceAll("/", "_") + ".answers";
    #rendu  = new Rendu();

    #elems  = [...document.querySelectorAll<HTMLElement>("*")]
                          .filter( t => t.tagName.startsWith("Q-") )
    #fields = this.#elems .map   ( e => getSignal(e, { answer: {} }) );

    #saveActive = false;

    #updateAnswerFromField(id: number) {
        this.#rendu.answers[id] = this.#fields[id].value;

        if( this.#saveActive )
            this.#rendu.saveToLocalStorage( this.#id );
    }

    #updateFieldFromAnswer(id: number) {

        const value = structuredClone(this.#fields[id].value ?? buildEmptyQuestion() );

        if( this.#rendu.answers[id] === null )
            value.answer = {};
        else
            value.answer = this.#rendu.answers[id].answer;

        console.warn("set", id, value);
        this.#fields[id].value = value;
    }

    #updateFields() {
        for(let i = 0; i < this.#rendu.answers.length; ++i)
            this.#updateFieldFromAnswer(i);
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

    async #init() {
        // initial state.
        await this.#rendu.loadFromLocalStorage(this.#id);
        this.#updateFields();

        for(let i = 0; i < this.#fields.length; ++i)
            this.#fields[i].listen( () => this.#updateAnswerFromField(i) );

        addEventListener("message", async (e) => {

            if( typeof e.data === "string" )
                return; // setImmediate junk.

            if( e.data.type === "corrige" ) {
                await this.#rendu.loadFromArrayBuffer( e.data.value );
                this.#updateFields();
                return;
            }
            if( e.data.type === "highlight" ) {
                this.#highlight(e.data.value);
                return;
            }

            console.warn("?", e);
        })

        this.#saveActive = true;
    }

    constructor() {

        /*
        if( p.has('ds') ) {

            let place = p.get('place');
            if( place === null ) {
                place = prompt('Entrez votre n° de place (e.g. S15-1A)')!.toUpperCase();
                history.pushState({}, "", `${location.search}&place=${place}`);
            }
        }
        */

        if(true) {

            const place = "1A";
            const ds_id = "00";
            // p.get('ds')
            this.#export = `${ds_id}_${location.hostname}_${place}.answers`;
        }

        this.#init();
    }

    get filename() {
        return this.#export;
    }

    async export() {
        download( await this.#rendu.saveToArrayBuffer(), this.filename, ".answers");
    }

    async import() {
        const data = (await upload(".answers"))!.arrayBuffer();
        await this.#rendu.loadFromArrayBuffer( await data );
        this.#updateFields();
    }
}

// ensure the DOM is ready before searching for questions
await whenDOMContentLoaded();

export default new TPPage();


/*

// h4ck...

export default class SujetTP {

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

    updateAnswer(q_id: number, content: string, qtype: string|null) {
        this.#rendu!.getAnswer(q_id).text = content;
        if(qtype !== null)
            this.#rendu!.getAnswer(q_id).qtype = qtype;
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

/*
// pour rendus :
import Rendu   from "../../TPEngine/src/Rendu";
import {SUJET} from "../../TPEngine/src/GUI/SujetTP";


*/