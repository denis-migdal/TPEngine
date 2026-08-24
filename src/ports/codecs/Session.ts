import JSZip from "jszip";
import { Codec } from "./core";

//TODO: use /exports/
import { StudentWorkCodec, StudentWorkData } from "./StudentWork";

export type SessionData = {
    subjectURL  : string,
    studentWorks: Record<string, StudentWorkData>,
    filenames   : Record<string, string>, 
    solution    : StudentWorkData;
};


function createEmptySessionData() {
    return {
        studentWorks: {},
        filenames   : {},
    } as SessionData
}

const SW_EXT = StudentWorkCodec.extension;

export const SessionCodec = new Codec({
    extension: ".zip",
    async encode(value) {
        const zip = new JSZip();

        zip.file("subject.url"      , value.subjectURL );
        zip.file(`solution${SW_EXT}`, await StudentWorkCodec.encode(value.solution) );

        for( const student in value.studentWorks ) {
            const rendu = StudentWorkCodec.encode(value.studentWorks[student]);
            zip.file(value.filenames[student], await rendu);
        }

        return await zip.generateAsync({type:"arraybuffer"});
    },
    // decode
    async decode(bytes: ArrayBuffer) {

        const result = createEmptySessionData();

        const zip = new JSZip();
        await zip.loadAsync(bytes);

        for(let filename in zip.files) {
            if(filename === "sujet.url" || filename === "subject.url") {
                result.subjectURL = (await zip.file(filename)!.async("string")).trim();
                continue;
            }

            const buffer = await zip.file(filename)!.async("arraybuffer");
            const studentWorkData = await StudentWorkCodec.decode(buffer);

            if(filename === `corrige${SW_EXT}` || filename === `solution${SW_EXT}`) {
                result.solution = studentWorkData;
                continue;
            }

            const studentID = filename.split('_')[2].slice(0,-8);
            result.studentWorks[studentID] = studentWorkData;
            result.filenames   [studentID] = filename;
        }

        return result;
    }
});

/*

    async import(buffer: ArrayBuffer, origin: unknown) {
        this.clear();
        // + set...
        this.observer.listen(answers);
        trigger(this, origin);
    }
    async export(): Promise<ArrayBuffer> {

        if( this.corrige === null || this.subjectURL === null)
            throw new Error("Can't export when no sessionData loaded!");
    }
*/