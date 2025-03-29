import LISS from "@LISS/libs/LISS";

const html = require('!!raw-loader!./index.html').default;
import {css as answer_css, setAnswerColor, setComment, setGlobalGrade} from "../QText/";
import { Answer } from "@TPEngine/structs/Answers";
export const css  = require('!!raw-loader!./index.css' ).default;

export type MultiTextAnswer = Answer<string[]> & { grades?: number[] };

class QMultiText extends LISS({html, css:[answer_css, css]})<MultiTextAnswer> {

    readonly pts = +this.host.getAttribute("pts")!;
    readonly nbFields = +this.host.getAttribute("count")!;
    readonly fields: HTMLElement[] = [];

    constructor() {
        super();

        const nbCols   = +this.host.getAttribute("cols")!;

        this.host.style.setProperty("--nb_cols", `${nbCols}`);

        const span_pts   = this.content.querySelector<HTMLElement>(".pts")!;
        span_pts.textContent = `${this.pts}`;
        
        const answers = this.content.querySelector(".answer_list")!;
        for(let i = 0; i < this.nbFields; ++i) {

            const item = document.createElement('div');
            item.append(`(${i+1})` );

            const field = document.createElement('div');
            field.classList.add("answer");
            field.toggleAttribute("contenteditable", true);
            field.addEventListener("input", () => this.#updateFromFields() );

            this.fields.push(field);
            answers.append( item, field );
        }

        this.signal.listen( () => { this.#updateFromSignal(); });        
    }

    #updateFromSignal() {

        const value  = this.signal.value;

        const list       = this.content.querySelector<HTMLElement>('.answer_list')!
        const span_grade = this.content.querySelector<HTMLElement>('.grade')!

        setGlobalGrade(span_grade, value, (grade) => grade * this.pts / this.nbFields);
        setComment(list.parentElement!, value);

        for(let i = 0; i < this.fields.length; ++i) {

            const field = this.fields[i];

            setAnswerColor(field, value?.grades?.[i]);

            const answer = value?.answer?.[i] ?? "";
            if( answer !== field.innerHTML )
                field.innerHTML = answer;
        }
    }

    #updateFromFields() {

        this.signal.value = {
            answer: [...this.content.querySelectorAll('[contenteditable]')].map( e => e.innerHTML ),
        }
    }
}

LISS.define("q-multitext", QMultiText);