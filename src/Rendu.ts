import { buffer2str, str2buffer } from "./utils/buffer";

const JSZip = require("jszip");

export type Question<T extends any = unknown> = {
    answer: {
        value     ?: T,
        grade     ?: number,
        comment   ?: string
        suspicious?: boolean,
    },
    meta?: {
        type    : string,
        invite  : string,
        //TODO...
    }
}

export default class Rendu {

    answers: any[] = [];

    async saveToLocalStorage(name: string) {
        const data = buffer2str( await this.saveToArrayBuffer() );
        localStorage.setItem(name, data);
    }
    async loadFromLocalStorage(name: string) {

        const saved_data = localStorage.getItem(name);
        if(saved_data === null) {
            this.answers = [];
            return;
        }
        await this.loadFromArrayBuffer( str2buffer(saved_data) );
    }

    async saveToArrayBuffer() {
        const zip = new JSZip();
        zip.file("answers", JSON.stringify(this.answers, null, '\t') );
        return await zip.generateAsync({type:"arraybuffer"});
    }

    async loadFromArrayBuffer(content: ArrayBuffer) {

        const zip = new JSZip();
        await zip.loadAsync(content);

        this.answers = JSON.parse( await zip.file("answers").async("string") );

        return this
    }
}
