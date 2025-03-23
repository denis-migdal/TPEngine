import Rendus, { StudentRendu } from "@TPEngine/Rendus";
import { buffer2str, str2buffer } from "@TPEngine/utils/buffer";
import { Question } from "@TPEngine/Rendu";

import "@TPEngine/Responses/RText";
import { RText } from "@TPEngine/Responses/RText";

//TODO...
const iframe = document.querySelector('iframe')!

const answers_html = document.querySelector<HTMLElement>('#answers')!;
const qid_html = document.querySelector('#q_id')!;
const nbq_html = document.querySelector('#nb_q')!;


export default class AnswersBrowser {

    constructor() {

        const saved_data = localStorage.getItem("sav");
        if(saved_data === null)
            return;

        (async () => {
            let {filename, content} = JSON.parse(saved_data);
            content = str2buffer(content);

            this.rendus = await Rendus.loadFromArrayBuffer(filename, content); // force update...


        })();
    }

    #cur_q = 0;
    #rendus: Rendus|null = null;

    get rendus() {
        return this.#rendus!;
    }

    set rendus(rendus: Rendus) {

        this.#rendus = rendus;
        nbq_html.textContent = `${rendus.nbQuestions}`;

        this.#rendus.corrige.saveToArrayBuffer().then( (e) => {
            iframe.contentWindow!.postMessage({ type: "corrige", value: e }, "*");
        });

        const filter = document.querySelector('#filter .students')!;
        let options = [];
        for(let student in rendus.data) {
            const line = document.createElement('div');
            const check = document.createElement("input");
            (check as any).student = student;
            check.setAttribute("type", "checkbox");
            check.checked = true;
            line.append(check, student);
            options.push(line);
        }
        
        filter.replaceChildren(...options);
        this.#filter = Object.keys(rendus.data);

        this.current_question = 0; // force update
        
        this.#on_changes();
    }

    #updateCorr( rendus: StudentRendu[], q_id: number, callback: (a: Question) => void ) {

        for(let rendu of rendus)
            callback( rendu.rendu.answers[q_id] );

        this.#on_changes();
    }

    async #on_changes() {

        const filename = this.#rendus!.filename;
        const content  = buffer2str( await this.#rendus!.toArrayBuffer() );
    
        localStorage.setItem("sav", JSON.stringify({content, filename}) );
    }

    prev_question() {

        if(this.#cur_q <= 0)
            return;
    
        --this.current_question; // force update
    }
    next_question() {

        if( this.#rendus === null || this.#cur_q + 1 >= this.#rendus.nbQuestions)
            return;
    
        ++this.current_question; // force update
    }

    get current_question() {
        return this.#cur_q;
    }

    #filter: string[] = [];
    set filter(f: string[]) {
        this.#filter = f;
        this.current_question = this.current_question; // force update...
    }

    getAnswers(id: number) {
        return Object.entries(this.#rendus!.data)
                    .filter( ([k,v]) => this.#filter.includes(k) )
                    .map( ([k,v]) => v.rendu.answers[id] );
    }
    
    set current_question(cur_q: number) {

        this.#cur_q = cur_q;
        qid_html.textContent = `${cur_q+1}`;

        // highlight question in subject...
        try {
            iframe.contentWindow?.postMessage({type: "highlight", value: cur_q}, "*");
        } catch(e) {
            console.warn(e);
        }

        console.warn( this.#rendus!.data);
        console.warn( this.getAnswers(cur_q) );

        RText.print(answers_html, this.getAnswers(cur_q) )

        return;

        //TODO...

        let answers: Record<string, StudentRendu[]> = {};
        for( let rendu of Object.values(this.#rendus!.data) )
            (answers[rendu.rendu.getAnswer(cur_q).text] ??= []).push( rendu );
        
        let sortedAnswers = Object.entries(answers).sort( (a,b) => a[0].localeCompare(b[0]) );

        const answerlist_html = sortedAnswers.map( ([answer, rendus]) => {

            // init
            let answer_status = "";
            if( answer === "")
                answer_status = " wrong";
    
            const ans = rendus[0].rendu.getAnswer(cur_q);

            if( ans.grade === 0 )
                answer_status = " wrong";
            if( ans.grade === 1 )
                answer_status = " correct";
    
            let sus_status = "";
            if( ans.suspicious === true)
                sus_status = " suspicious";
    
            let comment = ans.comments ?? "";
    
            // build
            // TODO: answer builder depending on type....
            const answer_html = str2html( //TODO: use LISS...
    `<div class="answer${ answer_status }${sus_status}">
        <div class="opts"><span class="ok">[O]</span><span class="nok">[X]</span><span class="sus">[S]</span><br/>(${ rendus.length })</div>
        <div class="field">
            <div class="text"></div>
            <input class="comment" value="${comment}" />
        </div>
    </div>`);

            const answer_text = answer_html.querySelector('.text')!;
            answer_text.textContent = answer;

            // events...

            // not optimal but osef
            answer_html.querySelector(".opts > .ok")!.addEventListener('click', () => {
                answer_html.classList.add('correct');
                answer_html.classList.remove('wrong');
    
                this.#updateCorr( rendus, cur_q, (a) => { a.grade = 1; } )
            });
            answer_html.querySelector(".opts > .nok")!.addEventListener('click', () => {
                answer_html.classList.add('wrong');
                answer_html.classList.remove('correct');
    
                this.#updateCorr( rendus, cur_q, (a) => { a.grade = 0; } );
            });
            answer_html.querySelector(".opts > .sus")!.addEventListener('click', () => {
                const sus = answer_html.classList.toggle('suspicious');
                this.#updateCorr( rendus, cur_q, (a) => { a.suspicious = sus; } );
            });
            const comment_html = answer_html.querySelector<HTMLInputElement>(".comment")!;
            comment_html.addEventListener('input', () => {
                this.#updateCorr( rendus, cur_q, (a) => { a.comments = comment_html.value; } );
            });
    
            return answer_html;

        });

        answers_html?.replaceChildren(...answerlist_html);
    }

}