const JSZip = require("jszip");

export type Answer = {
    text: string,
    comments   ?: string,
    grade      ?: number,
    suspicious ?: boolean
};

export default class Rendu {

    /* files : not supported yet */

    #answers: Answer[];

    constructor(answers: Answer[] = []) {
        this.#answers = answers;
        this.nbQuestions = answers.length;
    }

    getAnswer(idx: number) {

        // h4ck
        while( this.#answers.length <= idx )
            this.#answers.push({text: ""});

        return this.#answers[idx];
    }

    readonly nbQuestions: number;

    async toArrayBuffer() {
        
        const zip = new JSZip();
        zip.file("answers", JSON.stringify(this.#answers, null, '\t') );
        return await zip.generateAsync({type:"arraybuffer"});
    }

    static async loadFromArrayBuffer(content: ArrayBuffer) {

        const zip = new JSZip();
        await zip.loadAsync(content);

        const data = JSON.parse( await zip.file("answers").async("string") );

        return new Rendu(data);
    }

}