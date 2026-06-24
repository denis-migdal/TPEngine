import { upload } from "@TPEngine/utils/upload";
import { buffer2str, str2buffer } from "@TPEngine/utils/buffer";
import { download } from "@TPEngine/utils/download";
import Signal from "@LISS/src/signals/Signal";
import { SyncedSignal } from "@LISS/src";
// content/file : RO ou RW ???
export default class FileManager {
    #opts;
    #file = new Signal();
    #content = new SyncedSignal();
    constructor(opts) {
        this.#opts = opts;
        // Auto-save to localStorage...
        this.file_content.listen(() => {
            this.saveToLocalStorage(this.#opts.localStorage_name);
        });
        this.loadFromLocalStorage(this.#opts.localStorage_name);
    }
    get file() {
        return this.#file;
    }
    get file_content() {
        return this.#content;
    }
    async export() {
        const buffer = await this.saveToBuffer();
        if (buffer === null)
            return;
        // this is sync
        download(buffer, this.#opts.export_filename, this.#opts.extension);
    }
    async import() {
        //filename
        const file = (await upload(this.#opts.extension));
        if (file === null)
            return;
        await this.loadFromBuffer(await file.arrayBuffer(), file.name);
    }
    async saveToLocalStorage(name) {
        const buffer = await this.saveToBuffer();
        if (buffer === null)
            return;
        localStorage.setItem(this.#opts.localStorage_name, buffer2str(buffer));
    }
    async loadFromLocalStorage(name) {
        const data = localStorage.getItem(name);
        if (data === null) {
            const content = this.#content.source = new Signal();
            this.#file.value = {
                content,
                filename: ""
            };
            return;
        }
        await this.loadFromBuffer(str2buffer(data), name);
    }
    async saveToBuffer() {
        const value = this.file_content.value;
        if (value === null)
            return null;
        return await this.#opts.converter.toBuffer(value);
    }
    async loadFromBuffer(buffer, filename) {
        const content = new Signal();
        content.value = await this.#opts.converter.fromBuffer(buffer);
        // sync issue (?)
        this.#content.source = content;
        this.#file.value = { content, filename };
    }
}
//# sourceMappingURL=FileManager.js.map