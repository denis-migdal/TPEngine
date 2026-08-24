import { observe, listen } from "MWL@2026/exports/Reactive/Events";
import { Properties, updateProperties, WithProperties } from "MWL@2026/exports/Reactive/Properties";

import {StudentWork, Question } from "../StudentWork";

import "TPEngine@2026/core/Questions/";
import { IndexDB } from "../DataStore/IndexDB";

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

    localStoreEnabled = true;

    async openCorrection(data: ArrayBuffer) {
        this.localStoreEnabled = false;
        await this.studentWork.import(data, this);
    }

    async init() {
        await this.initLocalStore();
        this.initQuestions();
        this.initHighlight();
    }

    async initLocalStore() {

        const localStore = new IndexDB(this.studentWork,
                                       "studentWork");

        await localStore.load(location.pathname);

        const pthis = this;
        
        listen(this.studentWork, async function() {
            if(  ! pthis.localStoreEnabled
                && this.origin === localStore) return;
        
            await localStore.save(location.pathname);
        });
    }

    initQuestions() {

        const questions = this.questions.map( q => q.properties);

        for(let i = 0; i < questions.length; ++i)
            if( questions[i].QID === null) {
                console.warn("Question needs a QID !\n", genQID());
                continue;
            }

        syncArray(this.studentWork, questions);
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

function syncArray(     list: StudentWork,
                    elements: readonly Properties<Question<unknown>>[]) {

    for(let i = 0; i < elements.length; ++i) {

        if( elements[i].QID === null) {
            console.warn("Question needs a QID !\n", genQID());
            continue;
        }

        listen(elements[i], function() {
            if( this.origin === list) return;

            // this is easier to use the same origin.
            list.questions.set(elements[i].QID, elements[i], elements);
        });
    }

    // we could do it only upon load.
    observe(list, function () {

        if( this.origin === elements ) return;

        for(let i = 0; i < elements.length; ++i) {

            const data = list.questions.get(elements[i].QID);
            if( data === null )
                continue;

            // QID & coeff are fixed, won't be updated.
            updateProperties(elements[i], data, list);
        }
    });
}