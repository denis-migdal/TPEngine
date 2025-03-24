import LISS from "@LISS/libs/LISS";
import { Answer } from "@TPEngine/structs/Answers";

const html = require('!!raw-loader!./index.html').default;
export const css  = require('!!raw-loader!./index.css' ).default;

class QText extends LISS({html, style:css, css})<Answer<string>> {

    constructor() {
        super();

        const input = this.content.querySelector<HTMLInputElement>(".answer")!;

        this.signal.listen( () => {
            const value = this.signal.value?.answer ?? "";
            if( value !== input.innerHTML ) // avoid cursor update issue...
                input.innerHTML = value;
        });

        input.addEventListener("input", () => {

            this.signal.value = {
                answer: input.innerHTML
            };
        })
    }
}

LISS.define("q-text", QText);