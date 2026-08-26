import { Widget } from "MWL@2026/exports/Widget";
import { QuestionModel } from "TPEngine@2026/models/Questions";
import "TPEngine@2026/exports/Questions";

//TODO: move utils
export function mapValues<K extends string, T, U>(
                                            src: Record<K, T>,
                                            transform: (value: T) => U
                                        ) {

    const result = {} as Record<K, U>;

    for(const key in src)
        result[key] = transform(src[key]);

    return result;
}


function genQID() {
    return "#" + Math.random().toString(16).slice(2,10)
}

// @ts-ignore
globalThis["genQID"] = genQID;

export function getQuestions(): Record<string, Widget<QuestionModel>> {

    const elements = [...document.querySelectorAll<Widget<QuestionModel>>("*")]
                        .filter( t => t.localName.startsWith("q-") );

    const widgets: Record<string, Widget<QuestionModel>> = {};

    for(let i = 0; i < elements.length; ++i) {
        const qid = elements[i].api.qid;

        __ASSERT__(qid !== null, `Question requires a qid, e.g. ${genQID()}!`);
        __ASSERT__(!(qid in widgets), `Duplicated qid ${qid} !`);
        
        widgets[qid] = elements[i];
    }

    return widgets;
}

const HIGHLIGHT_CLASS = "highlight";
let prevHighlight: HTMLElement|null = null;
export function highlight(target: HTMLElement) {

    if(prevHighlight !== null)
        prevHighlight.classList.remove(HIGHLIGHT_CLASS);

    target.classList.add(HIGHLIGHT_CLASS);
    prevHighlight = target;
}

export function scrollTo(target: HTMLElement) {
    //const vh = document.documentElement.clientHeight;
    const ah = target.clientHeight;

    // not ideal...
    document.querySelector("main")!.scrollTo({
        top: target.offsetTop - (document.documentElement.clientHeight / 2 + ah / 2),
        behavior: "instant"
    });
}