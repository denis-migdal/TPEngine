import LISS from "@LISS/libs/LISS";
import { Question } from "@TPEngine/Rendu";

const html = require('!!raw-loader!./index.html').default;
const css  = require('!!raw-loader!./index.css' ).default;

export function buildEmptyQuestion<T>(): Question<T> {
    return {
        answer:{},
    }
}

class QText extends LISS({html, style:css, css})<Partial<Question<string>>> {

    constructor() {
        super();

        if(this.signal.value === null)
            this.signal.value = buildEmptyQuestion<string>();

        const invite = this.host.textContent!;
        this.content.querySelector(".invite")!.textContent = invite;

        this.signal.value.meta = {
            invite,
            type: "QText"
        }

        const input = this.content.querySelector<HTMLInputElement>(".answer")!;

        let update = true;

        this.signal.listen( () => {
            if(update)
                input.innerHTML = this.signal.value!.answer?.value ?? "";
        });

        input.addEventListener("input", () => {
            update = false;

            const value = structuredClone(this.signal.value)!;
            value.answer!.value = input.innerHTML;
            this.signal.value = value;

            update = true;
        })
    }
}

LISS.define("q-text", QText);