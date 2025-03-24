import LISS from "@LISS/libs/LISS";

const html = require('!!raw-loader!./index.html').default;
import {css as answer_css} from "../QText/";
import { Answer } from "@TPEngine/structs/Answers";
export const css  = require('!!raw-loader!./index.css' ).default;

class QMultiText extends LISS({html, css:[answer_css, css]})<Answer<string[]>> {

    constructor() {
        super();

        const nbFields = +this.host.getAttribute("count")!;
        const nbCols   = +this.host.getAttribute("cols")!;

        this.host.style.setProperty("--nb_cols", `${nbCols}`);
        
        const answers = this.content.querySelector(".answer_list")!;
        for(let i = 0; i < nbFields; ++i) {

            const item = document.createElement('div');
            item.append(`(${i+1})` );

            const field = document.createElement('div');
            field.classList.add("answer");
            field.toggleAttribute("contenteditable", true);
            field.addEventListener("input", () => this.#updateFromFields() );

            answers.append( item, field );
        }

        this.signal.listen( () => { this.#updateFromSignal(); });        
    }

    #updateFromSignal() {
        const fields = [...this.content.querySelectorAll('[contenteditable]')];

        for(let i = 0; i < fields.length; ++i) {
            const value = this.signal.value?.answer?.[i] ?? "";

            if( value !== fields[i].innerHTML )
                fields[i].innerHTML = value;
        }
    }

    #updateFromFields() {

        this.signal.value = {
            answer: [...this.content.querySelectorAll('[contenteditable]')].map( e => e.innerHTML ),
        }
    }
}

LISS.define("q-multitext", QMultiText);