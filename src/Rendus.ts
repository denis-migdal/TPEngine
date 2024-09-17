const JSZip = require("jszip");

import Rendu from "Rendu";

export type StudentRendu = {
    rendu: Rendu,
    filename    : string,
    student_id  : string,
    student_name: string,
}

export default class Rendus {

    readonly nbQuestions: number;
    readonly filename   : string;
    readonly data       : Record<string, StudentRendu>;

    constructor(filename: string, data: Record<string, StudentRendu>) {
        this.filename = filename;
        this.data     = data;

        this.nbQuestions = Math.max(0, ... Object.values(data).map( e => e.rendu.nbQuestions ) );;
    }

    async toArrayBuffer() {
        
        const zip = new JSZip();

        for( let srendu of Object.values(this.data) )
            zip.file(srendu.filename, await srendu.rendu.toArrayBuffer() );

        return await zip.generateAsync({type:"arraybuffer"});
    }

    static async loadFromArrayBuffer(filename: string, content: ArrayBuffer) {

        const zip = new JSZip();
        await zip.loadAsync(content);

        const data: Record<string, StudentRendu> = {};

        for(let filename in zip.files) {

            //TODO: allows only one file...
            const fileparts = filename.split('/');

            if(fileparts[1].length === 0 ) // dunno why
                continue;

            let student_dir = fileparts[0];
            let parts = student_dir.split('_');

            const student_id   = parts[parts.length - 3];
            const student_name = parts.slice(0, parts.length - 4).join('_');

            data[student_id] = {
                filename,
                student_id, student_name,
                rendu: await Rendu.loadFromArrayBuffer(await zip.file(filename).async("arraybuffer") )
            };
        }

        return new Rendus(filename, data);
    }
}