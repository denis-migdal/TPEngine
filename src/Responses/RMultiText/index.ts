import LISS from "@LISS/libs/LISS";
import { setAnswerColor } from "@TPEngine/Questions/QText";
import { Answer } from "@TPEngine/structs/Answers";

import {css as answer_css} from "../RText/";
import { MultiTextAnswer } from "@TPEngine/Questions/QMultiText";

const html = require('!!raw-loader!./index.html').default;
const css  = require('!!raw-loader!./index.css' ).default;

export default class RMultiText extends LISS({html, css: [css, answer_css]})<never> {

    constructor(questions: MultiTextAnswer[], callback: () => void) {
        super();

        const template = this.content.querySelector<HTMLTemplateElement>('.t_answer')!.content;

        const span_nb     = this.content.querySelector('.nb')!;
        const answers_div = this.content.querySelector<HTMLElement>('.answers')!;

        span_nb.textContent = `${questions.length}`;

        const answers = questions[0].answer ?? [];
        const grades  = questions[0].grades ?? [];

        for(let i = 0; i < answers.length; ++i) {

            const answer_div = template.cloneNode(true) as DocumentFragment;

            const answer_text__div = answer_div.querySelector<HTMLElement>(".answer")!;
            answer_text__div!.innerHTML = answers![i];

            // not ideal...
            const grade_html = answer_div.querySelector<HTMLInputElement>(".grade")!;
            
            if( grades[i] !== undefined) {
                grade_html.value = `${grades[i]}`;
                setAnswerColor(answer_text__div, grades[i]);
            }

            grade_html.addEventListener('input', () => {
                const grade = +grade_html.value;
                let sum = 0;

                for(let j = 0; j < questions.length; ++j) {
                    questions[j]!.grades ??= [];
                    questions[j]!.grades![i] = grade;
                }

                for(let j = 0; j < questions[0]!.grades!.length; ++j)
                    sum += questions[0]!.grades![j] ?? 0;

                for(let j = 0; j < questions.length; ++j)
                    questions[j]!.grade = sum;

                setAnswerColor(answer_text__div, grade);
                
                callback();
            });

            answers_div.append( answer_div );
        }

        const comment_html = this.content.querySelector<HTMLInputElement>(".comment")!;
        if( questions[0].comment !== undefined)
            comment_html.value = `${questions[0].comment!}`;
        comment_html.addEventListener('input', () => {
            for(let i = 0; i < questions.length; ++i)
                questions[i]!.comment = comment_html.value;
            
            callback();
        });
    }

    static print(target: HTMLElement, questions: MultiTextAnswer[], callback: () => void ) {

        //TODO: remove empty is false.
        //TODO: sort/merge/group...

        let x = new Array();
        for(let i = 0; i < questions.length; ++i)
            x[i] = new RMultiText([questions[i]], callback);

        target.replaceChildren( ...x );
    }
}

/*
    let answers: Record<string, StudentRendu[]> = {};
    for( let rendu of Object.values(this.#rendus!.data) )
        (answers[rendu.rendu.getAnswer(cur_q).text] ??= []).push( rendu );
    
    let sortedAnswers = Object.entries(answers).sort( (a,b) => a[0].localeCompare(b[0]) );
*/

LISS.define("r-multitext", RMultiText);