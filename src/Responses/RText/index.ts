import LISS from "@LISS/libs/LISS";
import { Answer } from "@TPEngine/structs/Answers";

const html = require('!!raw-loader!./index.html').default;
const css  = require('!!raw-loader!./index.css' ).default;

//TODO: + set of thingy...
export class RText extends LISS({html, style:css, css})<never> {

    constructor(questions: Answer<string>[], callback: () => void) {
        super();

        const span_nb = this.content.querySelector('.nb')!;
        const answer  = this.content.querySelector('.text')!;

        span_nb.textContent = `${questions.length}`;
        answer.innerHTML    = questions[0].answer!;

        const grade = this.content.querySelector<HTMLInputElement>(".grade")!;
        if( questions[0].grade !== undefined)
            grade.value = `${questions[0].grade!}`;

        grade.addEventListener('input', () => {
            for(let i = 0; i < questions.length; ++i) {
                console.warn(grade.value, typeof grade.value, +grade.value);
                questions[i]!.grade = +grade.value;
            }
            
            callback();
        });
        //TODO...
    }

    static print(target: HTMLElement, questions: Answer<string>[], callback: () => void ) {

        //TODO: remove empty is false.
        //TODO: sort/merge/group...

        let x = new Array();
        for(let i = 0; i < questions.length; ++i)
            x[i] = new RText([questions[i]], callback);

        target.replaceChildren( ...x );
    }
}

/*
    let answers: Record<string, StudentRendu[]> = {};
    for( let rendu of Object.values(this.#rendus!.data) )
        (answers[rendu.rendu.getAnswer(cur_q).text] ??= []).push( rendu );
    
    let sortedAnswers = Object.entries(answers).sort( (a,b) => a[0].localeCompare(b[0]) );
*/

LISS.define("r-text", RText);