import LISS from "@LISS/libs/LISS";
import { setAnswerColor } from "@TPEngine/Questions/QText";
import { Answer } from "@TPEngine/structs/Answers";

const html = require('!!raw-loader!./index.html').default;
const css  = require('!!raw-loader!./index.css' ).default;

//TODO: + set of thingy...
export class RText extends LISS({html, style:css, css})<never> {

    constructor(questions: Answer<string>[], callback: () => void) {
        super();

        const span_nb = this.content.querySelector('.nb')!;
        const answer  = this.content.querySelector<HTMLElement>('.answer')!;

        span_nb.textContent = `${questions.length}`;
        answer.innerHTML    = questions[0].answer!;

        const grade_html = this.content.querySelector<HTMLInputElement>(".grade")!;
        const grade = questions[0].grade
        if( grade !== undefined) {
            grade_html.value = `${grade}`;

            setAnswerColor(answer, grade);
        }

        grade_html.addEventListener('input', () => {
            const grade = +grade_html.value;
            for(let i = 0; i < questions.length; ++i) {
                questions[i]!.grade = grade;
            }

            setAnswerColor(answer, grade);
            
            callback();
        });

        const comment_html = this.content.querySelector<HTMLInputElement>(".comment")!;
        if( questions[0].comment !== undefined)
            comment_html.value = `${questions[0].comment!}`;
        comment_html.addEventListener('input', () => {
            for(let i = 0; i < questions.length; ++i)
                questions[i]!.comment = comment_html.value;
            
            callback();
        });
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