import LISS from "@LISS/libs/LISS";
import { Question } from "@TPEngine/Rendu";

const html = require('!!raw-loader!./index.html').default;
const css  = require('!!raw-loader!./index.css' ).default;

//TODO: + set of thingy...
export class RText extends LISS({html, style:css, css})<Partial<Question<string>>> {

    constructor(questions: Partial<Question<string>>[]) {
        super();

        const span_nb = this.content.querySelector('.nb')!;
        const answer  = this.content.querySelector('.text')!;

        span_nb.textContent = `${questions.length}`;
        answer.innerHTML    = questions[0].answer!.value!;

        //TODO...
    }

    static print(target: HTMLElement, questions: Partial<Question<string>>[] ) {

        //TODO: remove empty is false.
        //TODO: sort/merge/group...

        let x = new Array();
        for(let i = 0; i < questions.length; ++i) {
            x[i] = new RText([questions[i]]);
        }

        target.replaceChildren( ...x );

    }
}

LISS.define("r-text", RText);