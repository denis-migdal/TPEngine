const JSZip = require("jszip");

import Rendu from "./Rendu";

export type StudentRendu = {
    rendu       : Rendu,
    filename    : string,
    student_id  : string,
}

export default class Rendus {

    readonly nbQuestions: number;
    readonly filename   : string;
    readonly data       : Record<string, StudentRendu>;
    readonly corrige    : Rendu;

    constructor(filename: string, data: Record<string, StudentRendu>, corrige: Rendu) {
        
        this.filename = filename;
        this.data     = data;

        this.corrige  = corrige;

        this.nbQuestions = Math.max(0, ... Object.values(data).map( e => e.rendu.answers.length ) );;
    }

    async toArrayBuffer() {
        
        const zip = new JSZip();

        for( let srendu of Object.values(this.data) )
            zip.file(srendu.filename, await srendu.rendu.saveToArrayBuffer() );

        return await zip.generateAsync({type:"arraybuffer"});
    }

    static async loadFromArrayBuffer(filename: string, content: ArrayBuffer) {

        const zip = new JSZip();
        await zip.loadAsync(content);

        const data  : Record<string, StudentRendu> = {};
        let corrige!: Rendu;

        for(let filename in zip.files) {

            const rendu = await new Rendu().loadFromArrayBuffer(await zip.file(filename).async("arraybuffer") );

            if(filename === "corrigé.answers") {
                corrige = rendu;
                continue;
            }

            let [rng,ip,student_id] = filename.split('_');

            student_id = student_id.slice(0,-8);

            data[student_id] = {
                filename,
                student_id,
                rendu
            };
        }

        return new Rendus(filename, data, corrige);
    }
}