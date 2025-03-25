import "@TPEngine/Responses/RText";
import { RText } from "@TPEngine/Responses/RText";
import Signal from "@LISS/src/signals/Signal";
import { Rendus, RendusConv } from "./structs/Rendus";
import FileManager, { FileManagerOpts } from "./structs/FileManager";
import whenDOMContentLoaded from "@LISS/src/utils/DOM/whenDOMContentLoaded";
import { Answer, Answers2Buffer } from "./structs/Answers";

//TODO: in init GUI...
const iframe = document.querySelector('iframe')!

const answers_html = document.querySelector<HTMLElement>('#answers')!;
const qid_html     = document.querySelector('#q_id')!;
const qnb_html     = document.querySelector('#q_nb')!;

// not saved ?
type AnswersPage = {
    qid   : number,
    qnb   : number,
    filter: string[],
    questions: Questions
};


type Questions = {type: string}[];

export class AnswersBrowser implements FileManagerOpts<Rendus> {

    readonly extension = ".zip";
    readonly converter = RendusConv;
    readonly localStorage_name = "sav";

    get export_filename(): string {
        return this.#data.value?.filename!;
    }

    readonly #data = new FileManager(this);

    // not saved.
    #answers_page = new Signal<AnswersPage>({
        qid   : 0,
        qnb   : 0,
        filter: [],
        questions: []
    });

    #promise!: ReturnType<typeof Promise.withResolvers<Questions>>;

    constructor() {

        this.#initGUI();

        // file changed
        this.#data.listen( async () => {

            const value = this.#data.content.value;
            if(value === null)
                return; // dunno what to do...

            const filter = document.querySelector('#filter .students')!;
            let options = [];
            for(let rendu of value.rendus) {
                const line = document.createElement('div');
                const check = document.createElement("input");
                (check as any).student = rendu.student_id;
                check.setAttribute("type", "checkbox");
                check.checked = true;
                line.append(check, rendu.student_id);
                options.push(line);
            }
            
            filter.replaceChildren(...options);

            iframe.src = value.sujet_url;

            const buffer = await Answers2Buffer(value.corrige);
            this.#promise = Promise.withResolvers<{type: string}[]>();

            console.warn("sent");
            iframe.contentWindow!.postMessage({ type: "corrige", value: buffer }, "*");

            const qnb = value.corrige.length;
            this.#answers_page.value = {
                qid   : 0,
                qnb,
                filter: [],
                questions: await this.#promise.promise
            }
        });

        this.#answers_page.listen( () => {
            this.#updatePage();
        });
    }

    #initGUI() {

        addEventListener('message', ev => {

            console.warn('message', ev.data);

            if(typeof ev.data === "string")
                return;

            console.warn("!", ev.data);

            if(ev.data.type === "questions")
                this.#promise.resolve(ev.data.value);
        })

        // import-export
        document.querySelector('#export_answers')!.addEventListener('click', () => {
            this.#data.export();
        });
        document.querySelector('#import_answers')!.addEventListener('click', () => {
            this.#data.import();
        });

        // prev/next
        document.querySelector('#q_prev')!.addEventListener("click", () => {
            
            let page = this.#answers_page.value!;
            if( page.qid > 0 )
                this.#answers_page.value = {...page, qid: --page.qid};
        });

        document.querySelector('#q_next')!.addEventListener("click", () => {
            
            let page = this.#answers_page.value!;
            if( page.qid + 1 < page.qnb )
                this.#answers_page.value = {...page, qid: ++page.qid};
        });

        // filter
        const updateFilter = () => {
            const filter = [...document.querySelectorAll<HTMLInputElement>("#filter .students input")]
                    .filter(e => ! e.checked)
                    .map( e => (e as any).student);

            this.#answers_page.value = {...this.#answers_page.value!, filter};
        }

        const checkAll = document.querySelector<HTMLInputElement>("#filter > div > input")!;
        checkAll!.addEventListener('click', () => {
            for(let elem of document.querySelectorAll<HTMLInputElement>("#filter .students input") )
                elem.checked = checkAll.checked;

            updateFilter();
        });

        document.querySelector("#filter .students")!.addEventListener("click", (ev) => {
            const target = ev.target! as HTMLElement;
            if(target.tagName !== "INPUT")
                return;

            updateFilter();
        });
    }

    #updatePage() {

        const { qnb, qid, filter, questions } = this.#answers_page.value!;

        qnb_html.textContent = `${qnb}`;
        qid_html.textContent = `${qid+1}`;

        if(this.#data.content.value === null)
            return;

        // highlight question in subject...
        try {
            iframe.contentWindow?.postMessage({type: "highlight", value: qid}, "*");
        } catch(e) {
            console.warn(e);
        }

        console.warn(questions, qid);

        RText.print(answers_html, this.getAnswers<any>(qid), () => {
            // force update/save...
            this.#data.content.value = {...this.#data.content.value!};
        });
    }

    /**/

    getAnswers<T>(id: number) {

        const filter = this.#answers_page.value!.filter;

        return this.#data.content.value!.rendus
                    .filter( (rendu) => ! filter.includes(rendu.student_id) )
                    .map   ( (rendu) => rendu.answers[id] ) as Answer<T>[];
    }
    
    //TODO: remove -> use listen...
    /*
    set current_question(cur_q: number) {

        //TODO...

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
    
            // not optimal but osef
            answer_html.querySelector(".opts > .ok")!.addEventListener('click', () => {
                answer_html.classList.add('correct');
                answer_html.classList.remove('wrong');
    
                //this.#updateCorr( rendus, cur_q, (a) => { a.grade = 1; } )
            });
            answer_html.querySelector(".opts > .nok")!.addEventListener('click', () => {
                answer_html.classList.add('wrong');
                answer_html.classList.remove('correct');
    
                //this.#updateCorr( rendus, cur_q, (a) => { a.grade = 0; } );
            });
            answer_html.querySelector(".opts > .sus")!.addEventListener('click', () => {
                const sus = answer_html.classList.toggle('suspicious');
                //this.#updateCorr( rendus, cur_q, (a) => { a.suspicious = sus; } );
            });
            const comment_html = answer_html.querySelector<HTMLInputElement>(".comment")!;
            comment_html.addEventListener('input', () => {
                //this.#updateCorr( rendus, cur_q, (a) => { a.comments = comment_html.value; } );
            });
    
            return answer_html;

        });

        answers_html?.replaceChildren(...answerlist_html);
    }*/

}

// ensure the DOM is ready before searching for questions
await whenDOMContentLoaded();

export default new AnswersBrowser();