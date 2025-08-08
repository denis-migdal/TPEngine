import {LISS, WithBare, WithContent, WithMeta, WithRWValue, define} from "@LISS/libs/LISS";
import { AnswerMeta } from "@TPEngine/structs/Answers";

const html = require('!!raw-loader!./index.html').default;
const css  = require('!!raw-loader!./index.css' ).default;

import {css as answer_css, setAnswerColor, setComment, setGlobalGrade} from "../QText/";
import { upload } from "@TPEngine/utils/upload";

class QFile extends LISS({html, css:[answer_css, css]}, WithBare, WithContent, WithRWValue<{content: string, type:string}>, WithMeta<AnswerMeta>) {

    readonly pts        = +this.host.getAttribute("pts")!;
    readonly span_grade = this.content.querySelector<HTMLElement>('.grade')!;
    readonly answer     = this.content.querySelector<HTMLIFrameElement>('.answer')!;

    readonly accepts    = this.host.getAttribute('type') ?? "";

    constructor() {
        super();
        
        this.content.querySelector<HTMLElement>('.upload_btn')!.addEventListener('click', async () => {

            const file = (await upload(this.accepts))!;
            const data        = URL.createObjectURL(file);
            this.answer.src = data;

            this._output.value = {
                type   : file.type,
                // @ts-ignore : bytes & toBase64 exists in FF.
                content: (await file.bytes()).toBase64()
            }
        });

        this.answer.addEventListener("load", () => {

            const img = this.answer.contentDocument!.documentElement!
                                .querySelector('img');
            
            const body = this.answer.contentDocument!.body!;

            if( body !== null) {
                body.style.setProperty('height', '100vh')
                body.style.setProperty('width' , '100vw')
                body.style.setProperty('margin' , '0')
                body.style.setProperty('display', 'flex');
                body.style.setProperty('align-items', 'center');
                body.style.setProperty('justify-content', 'center');
            } else {
                const svg = this.answer.contentDocument!.documentElement;
                svg.style.setProperty("width", "100vw")
                svg.style.setProperty("height", "100vh")
            }

            /*if(img !== null) {
                img.style.setProperty('margin', 'auto');
            }*/
        })


        this._input.listen( () => {

            const value = this._input.value;
            if( value === null)
                return;
            const {type, content} = value;
            // @ts-ignore : fromBase64 should be added in Edge/Chrome soon.
            const file = new Blob([Uint8Array.fromBase64(content)], {type});
            const data = URL.createObjectURL(file);
            this.answer.src = data;

            this._output.value = { type, content }
        });

        this._meta.listen( () => {

            const meta = this._meta.value;

            setGlobalGrade(this.span_grade, meta, this.pts,
                            (grade) => grade * this.pts);
            setComment(this.answer!, meta);
            setAnswerColor(this.answer, meta?.grade);
        });
    }
}

define("q-file", QFile);