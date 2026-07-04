import { observe, observeChanges } from "MWL@2026:Reactive/Observers/observe";
import { updateProperties, WithProperties } from "MWL@2026:Reactive/Properties/createProperties";

import LocalStorage from "./DataStore/LocalStorage";
import StudentWork, { Question } from "./StudentWork";

import "TPEngine@2026:Questions/";

export type QuestionElement = HTMLElement & WithProperties<Question<unknown>>;

function genQID() {
    return Math.random().toString(16).slice(2,10)
}

// @ts-ignore
globalThis["genQID"] = genQID;

export class SubjectPage {

    readonly studentWork = new StudentWork();
    readonly questions: readonly QuestionElement[];

    constructor(questions: readonly QuestionElement[]) {
        this.questions = questions;
        this.init(); // async
    }

    async init() {
        await this.initLocalStorage();
        this.initQuestions();
        this.initHighlight();
    }

    async initLocalStorage() {

        const localStore = new LocalStorage(this.studentWork,
                                            location.pathname);
        await localStore.load();
        
        observeChanges(this.studentWork, async function() {
            if( this.origin === localStore) return;
        
            await localStore.save();
        });
    }

    initQuestions() {

        const work = this.studentWork;

        const questions = this.questions.map( q => q.properties);

        for(let i = 0; i < questions.length; ++i) {

            if( questions[i].QID === null) {
               
                console.warn("Question needs a QID !\n", genQID());

                continue;
            }

            observeChanges(questions[i], function() {
                if( this.origin === work) return;
    
                // this is easier to use the same origin.
                work.setQuestionData(questions[i], questions);
            });
        }
    
        observe(work, function () {
    
            if( this.origin === questions ) return;
    
            for(let i = 0; i < questions.length; ++i) {
    
                const data = work.getQuestionData(questions[i].QID);
                if( data === null )
                    continue;
    
                // QID & coeff are fixed, won't be updated.
                updateProperties(questions[i], data, work);
            }
        });
    }

    initHighlight() {
        // highlight
        addEventListener("message", (e) => {

            if( typeof e.data === "string" )
                return; // setImmediate junk.

            if( e.data.type === "highlight" ) {
                this.highlight(e.data.value);
                return;
            }
        })
    }

    highlight(QID: string) {

        document.querySelector(".answer_highlight")?.classList.remove("answer_highlight");

        const q = this.questions.find( (e) => e.properties.QID === QID);
        if( q === undefined)
            return;

        q.classList.add('answer_highlight');

        //const vh = document.documentElement.clientHeight;
        const ah = q.clientHeight;

        // not ideal...
        document.querySelector("main")!.scrollTo({
            top: q.offsetTop - (document.documentElement.clientHeight / 2 + ah / 2),
            behavior: "instant"
        });
    }
}