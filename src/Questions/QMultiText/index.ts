import LISS from "@LISS/libs/LISS";

const html = require('!!raw-loader!./index.html').default;

export const css  = require('!!raw-loader!./index.css' ).default;
import {css as answer_css, buildEmptyQuestion} from "../QText/";

class QMultiText extends LISS({html, css:[answer_css, css]})<string[]> {

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

        if(this.signal.value === null)
            this.signal.value = buildEmptyQuestion<string[]>();
        
        const invite = this.host.textContent!;
        //this.content.querySelector(".invite")!.textContent = invite;

        this.signal.value.meta = {
            invite,
            type: "QMultiText"
        }

        this.#update = true;
        this.signal.listen( () => {
            if(this.#update)
                this.#updateFromSignal();
        });        
    }

    #update = false;

    #updateFromSignal() {
        const fields = [...this.content.querySelectorAll('[contenteditable]')];

        for(let i = 0; i < fields.length; ++i)
            fields[i].innerHTML = this.signal.value!.answer?.value?.[i] ?? "";
    }

    #updateFromFields() {

        this.#update = false;

        const value = structuredClone(this.signal.value)!;
        value.answer!.value = [...this.content.querySelectorAll('[contenteditable]')].map( e => e.innerHTML );
        this.signal.value = value;

        this.#update = true;
    }
}

LISS.define("q-multitext", QMultiText);