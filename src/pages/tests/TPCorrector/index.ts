import { listen }      from "MWL@2026/exports/Reactive/Observable";
import { resolve }     from "MWL@2026/exports/DOM";
import { frameEffect } from "MWL@2026/exports/browser/scheduler";

import {StudentWork} from "TPEngine@2026/models/StudentWork";
import { SessionCodec } from "TPEngine@2026/ports/codecs/Session";
import { Session } from "TPEngine@2026/models/Session";
import { createQuestionModel, QuestionModel } from "TPEngine@2026/models/Questions";
import { StudentWorkData } from "TPEngine@2026/ports/codecs/StudentWork";
import {SessionData} from "TPEngine@2026/ports/codecs/Session";

import { createIndexDBStore, DataStore } from "TPEngine@2026/ports/stores/DataStore";
import { BrowserFileDriver } from "TPEngine@2026/ports/stores/drivers/BrowserFile";
import { throttle } from "TPEngine@2026/presentation/TPSubject";
import { download } from "TPEngine@2026/ports/stores/core/download";

import {Pager} from "TPEngine@2026/widgets/Pager";
import { createAnswerReviewWidget } from "TPEngine@2026/widgets/AnswerReviews";
import { pauseReactions, resumeReactions } from "MWL@2026/core/Reactive/PropertySystem/ReactiveObject/ReactiveScheduler";
import { forwardProperties } from "MWL@2026/core/Reactive/PropertySystem/Properties/sync";
import { Filter } from "TPEngine@2026/presentation/TPCorrector";

const CUR_SUBJECT_LSNAME = "TPEngine.TPCorrector.cur";

//TODO: global ctx ?

let answerReviews: HTMLElement[][] = [];
const elems = getElements();
const filter = new Filter(elems.studentFilter, elems.studentFilterCA);

{
    const data  = await initSession(elems);

    initPagination(elems, data.session);

    initTransfertFeature(data, elems);
}

///////
// Helpers
///////


function updateAnswersVisibility() {
    for(let i = 0; i < answerReviews.length; ++i)
        for(let j = 0; j < answerReviews[i].length; ++j) {
            const field = answerReviews[i][j];
            field.classList.toggle("hidden", ! filter.value[getStudent(field)]);
        }
}
listen( filter, updateAnswersVisibility);


function getElements() {
    return resolve(document.body, {
                        importBtn      : HTMLElement,
                        exportBtn      : HTMLElement,
                        csvExportBtn   : HTMLElement,
                        iframe         : HTMLIFrameElement,
                        pager          : Pager,
                        answersArea    : HTMLElement,
                        studentFilter  : HTMLElement,
                        studentFilterCA: HTMLInputElement,
                    });
}

const STUDENT = Symbol();
function setStudent(target: any, name: string) {
    target[STUDENT] = name;
}
function getStudent(target: any): string {
    return target[STUDENT];
}

function initPagination(
                        elems: {
                            pager : Pager,
                            iframe: HTMLIFrameElement,
                            answersArea    : HTMLElement,
                        },
                        session: Session
                    ) {

    initHighlight(elems, session);

    listen(elems.pager, frameEffect(() => {
        const fields = answerReviews[elems.pager.api.value];
        elems.answersArea.replaceChildren(...fields);
    }));
}

function initHighlight(
                        elems: {
                            pager : Pager,
                            iframe: HTMLIFrameElement
                        },
                        session: Session
                    ) {

    listen(elems.pager, frameEffect(() => {

        const qid = Object.keys(session.solution.questions)[elems.pager.api.value];

        elems.iframe.contentWindow?.postMessage({
                                                type: "highlight",
                                                value: qid
                                            }, "*");

    }));
}

async function initSession(elems: {
        iframe: HTMLIFrameElement,
        pager : Pager,
    }) {

    const session = new Session();

    const r = {
        session,
        curName: "",
    }

    const localStore = createIndexDBStore('TPCorrector', SessionCodec);
    let name = localStorage.getItem(CUR_SUBJECT_LSNAME);

    if(name !== null) {
        r.curName = name;
        const data = await localStore.load(name);
        if( data !== null)
            loadSession(elems, data, session);
    }

    listen(session, throttle(2000, () => localStore.save(r.curName, session)));

    return r;
}

function formatName(url: string) {
    let name = new URL(url).pathname;

    if(name[0] === "/")             name = name.slice(1);
    if(name[name.length-1] === "/") name = name.slice(0,-1);

    return name;
}

function initTransfertFeature(
                                cfg: {
                                    session: Session
                                    curName: string,
                                },
                                elems: {
                                    iframe   : HTMLIFrameElement
                                    importBtn: HTMLElement,
                                    exportBtn: HTMLElement,
                                    csvExportBtn: HTMLElement,
                                    pager       : Pager,
                                },
                            ) {

    const ds = new DataStore(new BrowserFileDriver('.zip'), SessionCodec);

    elems.csvExportBtn.addEventListener("click", () => exportCSV(cfg.session))
    elems.exportBtn.addEventListener("click", () => ds.save(cfg.curName,
                                                            cfg.session) );

    elems.importBtn.addEventListener("click", async () => {

        const file = await ds.pick();
        if( file === null) return;

        cfg.curName = formatName(file.content.subjectURL);
        localStorage.setItem(CUR_SUBJECT_LSNAME, cfg.curName);

        loadSession(elems, file.content, cfg.session);
    });
}

async function loadSession(
                    elems: {
                        iframe: HTMLIFrameElement,
                        pager : Pager,
                    },
                    data: SessionData,
                    session: Session
                ) {

    session.set({
                subjectURL  : data.subjectURL,
                solution    : data.solution,
                filenames   : data.filenames,
                studentWorks: loadStudentWorks(data.studentWorks)
            });

    await updateSubjectPage(elems.iframe, data.subjectURL, data.solution);

    resetReviewSystem(elems, session);
    filter.updateList(Object.keys(session.studentWorks));
}

function resetReviewSystem(elems: {pager : Pager}, session: Session) {

    const keys = Object.keys(session.solution.questions);

    pauseReactions(session);

    answerReviews.length = keys.length;
    for(let i = 0; i < keys.length; ++i) {
        answerReviews[i] = new Array();

        let studentNames = Object.keys(session.studentWorks);
        for(let j = 0; j < studentNames.length; ++j) {
            const student  = studentNames[j];
            const question = session.studentWorks[student].questions[keys[i]];
            const widget   = createAnswerReviewWidget(question);
            setStudent(widget, student);

            // @ts-ignore
            forwardProperties(widget, question);
            answerReviews[i][j] = widget;
        }
    }

    resumeReactions(session);

    elems.pager.api.reset(keys.length);
}

function loadStudentWorks(studentWorksData: Record<string, StudentWorkData>) {
    const studentWorks: Record<string, StudentWork> = {};
    for(const name in studentWorksData) {

        const questions: Record<string, QuestionModel> = {};
        const questionsData = studentWorksData[name].questions;
        for(const qid in questionsData) {
            questions[qid] = createQuestionModel(questionsData[qid]);
        }

        studentWorks[name] = new StudentWork(questions);
    }
    return studentWorks;
}

async function updateSubjectPage(
                            target  : HTMLIFrameElement,
                            url     : string,
                            solution: StudentWorkData
                        ) {

        const {promise, resolve} = Promise.withResolvers<void>();

        // need to wait the page to load in order to push the corrige.
        target.addEventListener("load", () => {
            target.contentWindow!.postMessage({
                type: "solution",
                value: solution }, "*");

            resolve();

        }, {once: true});

        target.src = url;

        await promise;
}

function exportCSV(session: Session) {
    
    let data = "Name\tGrade";

    const solution = session.solution;

    const questions: Record<string, number|null> = {};
    for(const key in solution.questions ) {
        const q = solution.questions[key];
        questions[q.qid!] = q.coeff;
        data += `\t${q.qid!} /${q.coeff ?? 0}`;
    }

    data += "\n";

    const rendus = session.studentWorks;
    for(const studentID in rendus) {

        const rendu = rendus[studentID];

        data += studentID;

        data += "\t";
        
        let details = "";
        let sum    = 0;

        for(const qid in questions) {
            const answer = rendu.questions[qid];

            if(answer === null || answer.score === null) {
                details += "\t";
                continue;
            }
            details += `\t${answer.score}`;

            const coeff = questions[qid];

            if(coeff !== null)
                sum += answer.score * coeff;
        }

        data += `${sum}${details}\n`;
    }

    download(data, "notes.csv", ".csv");
};