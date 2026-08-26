import { StudentWork } from "TPEngine@2026/models/StudentWork";
import { getQuestions, highlight, mapValues } from "./dom";
import { getExternalStudentWorkStore, getLocalStudentWorkStore } from "./stores";
import { listen } from "MWL@2026/core/Reactive/Observers";
import { pauseReactions, resumeReactions } from "MWL@2026/core/Reactive/PropertySystem/ReactiveObject/ReactiveScheduler";
import { setProperties } from "MWL@2026/core/Reactive/PropertySystem/Properties/PropertiesProvider";
import { Widget } from "MWL@2026/core/DOM/Widget";
import { QuestionModel } from "TPEngine@2026/models/Questions";
import { scrollTo } from "./dom";
import { createToolbar } from "./toolbar";
import { StudentWorkCodec, StudentWorkData } from "TPEngine@2026/ports/codecs/StudentWork";
import { loadConfig } from "./loadConfig";

// orchestrator
export async function initTPSubjectPage() {

    const cfg              = loadConfig();
    const questionsWidgets = getQuestions();
    const work             = createStudentWork(questionsWidgets);

    // asap to catch messages.
    if( cfg.isInCorrector) enableCorrectorFeatures(work, questionsWidgets);
    
    await initStudentWork(cfg, work);

    if( cfg.isDS ) enableExternalAutoSave(work);

    initTransfertToolbar(cfg, work);
}

function createStudentWork(
                    questionWidgets: Record<string, Widget<QuestionModel>>
                ) {
    return new StudentWork(mapValues(questionWidgets, (w => w.api) ));
}

function enableCorrectorFeatures(
                    work: StudentWork,
                    questionsWidgets: Record<string, Widget<QuestionModel>>
                ) {
    initHighlightSystem(questionsWidgets);
    listenSolution(work);
}

async function initStudentWork(
                        cfg: {
                            solution : null|Promise<StudentWorkData>,
                            subjectID: string,
                            isInCorrector: boolean,
                        },
                        work: StudentWork
                    ) {

    if( cfg.isInCorrector )
        return;

    if( cfg.solution !== null ) {
        loadData(await cfg.solution, work);
        return;
    }

    const localStore = getLocalStudentWorkStore();

    const data = await localStore.load(cfg.subjectID);
    if( data !== null)
        loadData(data, work);

    // 500ms à 2sec recommandé ?
    listen(work, throttle(500, () => localStore.save(cfg.subjectID, work)) );
}

function enableExternalAutoSave(work: StudentWork) {
    listen(work, throttle(2000, () => send(`${location.origin}/save`, work)));
}

function loadData(data: StudentWorkData, work: StudentWork) {

    pauseReactions(work);

    for(const keys in work.questions) {

        const qdata = data.questions[keys] ?? {};

        setProperties(work.questions[keys], qdata);
    }
    
    resumeReactions(work);
}

function submit(student: string, work: StudentWork) {
    if( ! confirm(`${student}\nÊtes vous sur de vouloir rendre ?`) )
        return;
    
    send(`${location.origin}/submit?name=${student}`, work);
}

async function send(url: string, work: StudentWork) {

    const buffer = await StudentWorkCodec.encode(work);

    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
        },
        body: buffer
    });
}

function initTransfertToolbar(cfg: {
                            subjectName: string,
                            isDS: boolean,
                            student: string|null
                        },
                    work: StudentWork) {
    
    const fileStore = getExternalStudentWorkStore();

    createToolbar(cfg.isDS, {
        onImport: async () => {
            const data = await fileStore.load(cfg.subjectName);
            if( data === null) return;
            loadData( data, work);
        },
        onExport: () => {
            if( ! cfg.isDS )
                fileStore.save(cfg.subjectName, work);
            else
                submit(cfg.student!, work);
        }
    });
}

//TODO move out.
export function throttle(ms: number, callback: () => void) {
    
    let pending = false;

    const timeoutCallback = () => {
        pending = false;
        callback();
    }
    
    return () => {
        if( pending === true)
            return;
        pending = true;
        setTimeout(timeoutCallback, ms);
    }
}

function listenSolution(work: StudentWork) {

    window.addEventListener("message", (ev) => {

        if( typeof ev.data === "string" )
            return; // setImmediate junk.

        if( ev.data.type !== "solution" )
            return;

        loadData(ev.data.value, work);
    });
}

function initHighlightSystem(targets: Record<string, Widget<QuestionModel>>) {
    // highlight
    addEventListener("message", (e) => {

        if( typeof e.data === "string" )
            return; // setImmediate junk.

        if( e.data.type !== "highlight" )
            return;

        const target = targets[e.data.value];
        highlight(target);
        scrollTo (target);
    })
}