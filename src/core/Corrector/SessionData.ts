import { trigger, ObservableObject } from "MWL@2026:exports/Reactive/Events";
import { Observer } from "MWL@2026:exports/Reactive/observers";

import JSZip from "jszip";
import { Serializable } from "../DataStore/core/interfaces";
import StudentWork from "../StudentWork";

export default class SessionData extends ObservableObject
                                implements Serializable {

    resourceName = "";

    subjectURL: string|null      = null;
    corrige   : StudentWork|null = null;

    rendus: Record<string, StudentWork> = {};

    private readonly observer = new Observer( () => {
        trigger(this, this.observer);
    });

    clear() {

        this.observer.clear();

        this.subjectURL = null;
        this.corrige    = null;
        this.rendus     = {};
    }

    async import(buffer: ArrayBuffer, origin: unknown) {

        this.clear();

        const zip = new JSZip();
        await zip.loadAsync(buffer);

        for(let filename in zip.files) {

            if(filename === "sujet.url") {
                this.subjectURL = (await zip.file(filename)!.async("string")).trim();
                continue;
            }

            const answers = new StudentWork();
            await answers.import(await zip.file(filename)!.async("arraybuffer"),origin);
            answers.resourceName = filename;

            if(filename === "corrige.answers") {
                this.corrige = answers;
                continue;
            }

            this.observer.listen(answers);

            // TODO: from Moodle + verif RNG/IP.
            const studentID = filename.split('_')[2].slice(0,-8);
            this.rendus[studentID] = answers;
        }
    
        trigger(this, origin);
    }
    async export(): Promise<ArrayBuffer> {

        if( this.corrige === null || this.subjectURL === null)
            throw new Error("Can't export when no sessionData loaded!");

        const zip = new JSZip();

        zip.file("sujet.url", this.subjectURL );
        zip.file("corrige.answers", await this.corrige.export() );

        for( const student in this.rendus ) {
            const rendu = this.rendus[student];
            zip.file(rendu.resourceName, await rendu.export() );
        }

        return await zip.generateAsync({type:"arraybuffer"}) as ArrayBuffer;
    }
}

