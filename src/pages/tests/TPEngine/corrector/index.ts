import { listen }           from "MWL@2026/exports/Reactive/Events";
import { updateProperties, WithProperties } from "MWL@2026/exports/Reactive/Properties";
import {ObservationArena}   from "MWL@2026/exports/Reactive/observers";
import { resolve }          from "MWL@2026/exports/DOM";

import {BrowserFile} from "TPEngine@2026/core/DataStore/BrowserFile";
import {Pager} from "TPEngine@2026/core/Corrector/Pager";
import {SessionData} from "TPEngine@2026/core/Corrector/SessionData";
import {IndexDB} from "TPEngine@2026/core/DataStore/IndexDB";
import { QuestionData } from "TPEngine@2026/core/StudentWork";
import { download } from "TPEngine@2026/core/DataStore/core/download";
import {Filter} from "TPEngine@2026/core/Corrector/Filter";
import {QuestionGraders} from "TPEngine@2026/core/QuestionGrader";

const elems = resolve(document.body, {
                        importBtn      : HTMLElement,
                        exportBtn      : HTMLElement,
                        csvExportBtn   : HTMLElement,
                        iframe         : HTMLIFrameElement,
                        pager          : Pager,
                        answersArea    : HTMLElement,
                        studentFilter  : HTMLElement,
                        studentFilterCA: HTMLInputElement,
                    });

///////
// Session
///////

const filter = new Filter(elems.studentFilter, elems.studentFilterCA);

const session = new SessionData();

function updateSubjectPage(url: string, corrige: ArrayBuffer) {

        // need to wait the page to load in order to push the corrige.
        elems.iframe.addEventListener("load", () => {
            elems.iframe.contentWindow!.postMessage({
                type: "corrige",
                value: corrige }, "*");
        }, {once: true});

        elems.iframe.src = url;
}

// set subject...
listen(session, async function() {
    if( this.origin !== localStore && this.origin !== file )
        return;

    // update subject
    updateSubjectPage(session.subjectURL!, await session.corrige!.export())

    updateProperties(elems.pager, {
        cur: 0,
        max: session.corrige!.questions.keys().length,
    });

    filter.updateList(Object.keys(session.rendus));
})

///////
// Storage
///////

const localStore = new IndexDB(session, "corrector");

const curSession = localStorage.getItem("TPEngine.corrector.cur");
if( curSession !== null) {
    await localStore.load(curSession);
}

listen(session, async function() {

    if( this.origin === file) {
        const url = new URL(session.subjectURL!);
        let name = url.pathname;
        if(name[0] === "/")             name = name.slice(1);
        if(name[name.length-1] === "/") name = name.slice(0,-1);
        localStore.target.resourceName = name;
    }
    if( this.origin === localStore) return;

    // avoid data loss (e.g. loading another before exporting current one)
    localStorage.setItem(
                        "TPEngine.corrector.cur",
                        localStore.target.resourceName
                    );
    await localStore.save();
});

const file = new BrowserFile(session, ".zip");
elems.importBtn.addEventListener("click", () => file.load() );
elems.exportBtn.addEventListener("click", () => file.save() );

///////
// Export
///////

elems.csvExportBtn.addEventListener("click", () => {
    
    let data = "Name\tGrade";

    const corrige = session.corrige!;

    const questions: Record<string, number|null> = {};
    for(const key of corrige.questions.keys() ) {
        const q = corrige.questions.get(key)!;
        questions[q.QID] = q.coeff;
        data += `\t${q.QID} /${q.coeff ?? 0}`;
    }

    data += "\n";

    const rendus = session.rendus;
    for(const studentID in rendus) {

        const rendu = rendus[studentID];

        data += studentID;

        data += "\t";
        
        //TODO: la somme

        let details = "";
        let sum    = 0;

        for(const qid in questions) {
            const answer = rendu.questions.get(qid);

            if(answer === null || answer.score === null) {
                details += "\t";
                continue;
            }
            details += `\t${answer.score}`;

            const coeff = questions[qid];

            if(coeff !== null)
                sum += answer.score * coeff;
        }
        //for(let i = 0; i < rendu.answers.length; ++i)
        //    data += "\t" + (rendu.answers[i]?.meta?.grade ?? 0);

        data += `${sum}${details}\n`;
    }

    download(data, "notes.csv", ".csv");
});

///////
// Navigation
///////

const arena  = new ObservationArena();
let fields   = new Array<HTMLElement>();

listen(elems.pager, () => {

    const IDS = session.corrige!.questions.keys();

    const QID = IDS[elems.pager.properties.cur];
    
    elems.iframe.contentWindow?.postMessage({
                                                type: "highlight",
                                                value: QID
                                            }, "*");

    fields = [];

    arena.clear();

    const question = session.corrige!.questions.get(QID)!;

    const QG = QuestionGraders[question.type as keyof typeof QuestionGraders];

    //TODO: merge...
    for(const student in session.rendus) {
        const rendu = session.rendus[student];
        
        const answer = rendu.questions.get(QID);

        const qg = new QG(answer as any) as
                                        WithProperties<QuestionData<unknown>>
                                      & HTMLElement;

        arena.listen(qg, () => {
            const qdata = qg.properties;
            rendu.questions.set(qdata.QID, qdata, arena);
        });

        //TODO: [names]
        qg.dataset.studentName = student;

        fields.push( qg );
    }
    updateAnswersVisibility();
    elems.answersArea.replaceChildren(...fields);
});

function updateAnswersVisibility() {

    for(let i = 0; i < fields.length; ++i) {
        const field = fields[i];
        const name = field.dataset.studentName!;

        field.classList.toggle("hidden",  ! filter.value[name]);
    }
}

listen( filter, updateAnswersVisibility);