import "@TPEngine/Questions/QText";
import "@TPEngine/Questions/QMultiText";
import "@TPEngine/Questions/QFile";
import FileManager from "../structs/FileManager";
import { AnswersConv } from "../structs/Answers";
import { InputMerger, OutputMerger } from "@LISS/src/signals";
import { getInput, getMeta, getOutput } from "@LISS/src";
export class TPAnswers {
    extension = ".answers";
    converter = AnswersConv;
    localStorage_name = location.pathname;
    export_filename;
    // internal use only
    filemanager = new FileManager(this);
    #input;
    #meta;
    constructor({ export_filename }, ...inputs) {
        this.export_filename = export_filename;
        this.#input = new InputMerger(...inputs.map(i => getInput(i)));
        this.#meta = new InputMerger(...inputs.map(i => getMeta(i)));
        const out = new OutputMerger(...inputs.map(i => getOutput(i)));
        out.listen(() => {
            const value = out.value;
            if (value === null)
                return; // should not occurs ?
            const initial = this.filemanager.file_content.value;
            this.filemanager.file_content.value = value.map((e, idx) => {
                const elem = { answer: e };
                const meta = initial?.[idx]?.meta;
                if (meta !== undefined)
                    elem.meta = meta;
                return elem;
            });
        });
        // do NOT listen to file_content.
        this.filemanager.file.listen(() => this.#updateFields());
    }
    #updateFields() {
        const content = this.filemanager.file_content.value;
        if (content === null) {
            this.#input.value = null;
            return;
        }
        this.#input.value = content.map(e => e.answer);
        this.#meta.value = content.map(e => e.meta ?? null);
    }
    import() { this.filemanager.import(); }
    export() { this.filemanager.export(); }
    load(buffer, filename) {
        this.filemanager.loadFromBuffer(buffer, filename);
    }
}
//# sourceMappingURL=TPAnswers.js.map