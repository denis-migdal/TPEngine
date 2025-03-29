import LISS from "@LISS/libs/LISS";
import { Answer } from "@TPEngine/structs/Answers";

const html = require('!!raw-loader!./index.html').default;
export const css  = require('!!raw-loader!./index.css' ).default;

export function get<T extends Record<string,any>, K extends keyof T>(obj: null|T, key: K, transform: (val:Exclude<T[K], undefined>) => any = v => v): string {
    const value = obj?.[key];
    if( value === undefined)
        return "";
    return `${transform(value)}`;
}

export function setComment(target: HTMLElement, answer: Answer|null) {

    const comment = get(answer, "comment");
    if(comment === "")
        target.removeAttribute("comment");
    else
        target.setAttribute("comment", comment);
}

export function setGlobalGrade(target: HTMLElement, answer: Answer|null, pts: (grade: number) => number) {
    target.textContent = get(answer, "grade", val => pts(val) );
}

export function setAnswerColor(target: HTMLElement, grade: number|undefined) {

    if( grade == undefined) {
        target.removeAttribute('grade');
    } else if(grade === 0) {
        target.setAttribute('grade', "0");
    } else if(grade === 1) {
        target.setAttribute('grade', "1");
    } else if(grade <= 0.5) {
        target.setAttribute('grade', "<=.5");
    } else if(grade >  0.5) {
        target.setAttribute('grade', ">.5");
    }
}

class QText extends LISS({html, style:css, css})<Answer<string>> {

    constructor() {
        super();

        const input = this.content.querySelector<HTMLInputElement>(".answer")!;

        const span_grade = this.content.querySelector<HTMLElement>(".grade")!;
        const span_pts   = this.content.querySelector<HTMLElement>(".pts")!;

        const pts            = +this.host.getAttribute("pts")!;
        span_pts.textContent = `${pts}`;

        this.signal.listen( () => {

            const value = this.signal.value;

            setGlobalGrade(span_grade, value, (grade) => grade*pts);
            setAnswerColor(input, value?.grade);
            setComment(input, value);

            const answer = get(value, "answer");
            if( answer !== input.innerHTML )// avoid cursor update issue... 
                input.innerHTML = answer;
        });

        input.addEventListener("input", () => {

            this.signal.value = {
                answer: input.innerHTML
            };
        })
    }
}

LISS.define("q-text", QText);