import { ObservableObject, ObservableProxy, trigger } from "MWL@2026:exports/Reactive/Events";
import { Properties  } from "MWL@2026:exports/Reactive/Properties";

import JSZip from "jszip";
import { Serializable } from "./DataStore/core/interfaces";

export type QuestionData<T extends unknown> = {
    QID    : string,
    comment: string,
    score  : number|null,
    coeff  : number|null,
    answer : T,
}

// 'cause we can listen to it.
export type Question<T extends unknown> = Properties<QuestionData<T>>;


export default class StudentWork
                        extends ObservableProxy<Dict<QuestionData<unknown>>>
                        implements Serializable {

    //TODO: use null...
    resourceName = "unnamed";

    readonly questions;

    constructor() {
        const questions = new Dict<QuestionData<unknown>>();
        super(questions);
        this.questions = questions;
    }

    async import(buffer: ArrayBuffer, origin: unknown) {

        const zip = new JSZip();
        await zip.loadAsync(buffer);

        const file = zip.file("answers")!;
        const data = JSON.parse( await file.async("string") ); // as X

        /*
        this.questions.clear();
        for(const key in data)
            this.questions.set(key, data[key], this);
        */

        // h4ck
        this.questions.data = data;
        trigger(this.questions, origin);
    }
    async export() {
        const zip = new JSZip();
        zip.file("answers", JSON.stringify(this.questions.data, null, '\t') );

        return await zip.generateAsync({type:"arraybuffer"}) as ArrayBuffer;
    }
}

//TODO: move.
class Dict<T> extends ObservableObject {

    data: Record<string, T> = {};

    get(key: string): T|null {
        const entry = this.data[key];
        if(entry === undefined) return null;
        return entry;
    }
    set(key: string, value: T, origin: unknown = null) {
        this.data[key] = value;
        trigger(this, origin);
    }

    clear() {
        this.data = {};
    }
    keys() {
        return Object.keys(this.data);
    }
    values() {
        return Object.values(this.data);
    }
}