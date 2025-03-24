import { upload } from "@TPEngine/utils/upload";
import { buffer2str, str2buffer } from "@TPEngine/utils/buffer";
import { download } from "@TPEngine/utils/download";
import Signal from "@LISS/src/signals/Signal";

export type Converter<T> = {
    fromBuffer: (buffer: ArrayBuffer) => Promise<T>,
      toBuffer: (  data: T          ) => Promise<ArrayBuffer>
}

export type FileManagerOpts<T> = {
    readonly extension: string,
    readonly converter: Converter<T>,
    readonly localStorage_name: string,
    readonly export_filename  : string
}

type File<T> = {
    readonly filename: string|null,
    readonly content : Signal<T>
}

export default class FileManager<T> extends Signal<File<T>> {

    #opts: FileManagerOpts<T>;

    constructor(opts: FileManagerOpts<T>) {
        super({
            filename: null,
            content : new Signal<T>()
        });

        this.#opts = opts;

        // Auto-save to localStorage...
        this.content.listen( () => {
            console.warn("save", this.#opts.localStorage_name);
            this.saveToLocalStorage(this.#opts.localStorage_name)
        });

        this.loadFromLocalStorage(this.#opts.localStorage_name);
    }

    get content() {
        return this.value!.content;
    }

    async export() {

        const buffer = await this.saveToBuffer();
        if( buffer === null)
            return;

        // this is sync
        download( buffer, this.#opts.export_filename, this.#opts.extension);
    }
    async import() {
        //filename
        const file = (await upload(this.#opts.extension))!;

        if(file === null)
            return;

        this.loadFromBuffer( await file.arrayBuffer(), file.name );
    }

    async saveToLocalStorage(name: string) {

        const buffer = await this.saveToBuffer();
        if( buffer === null)
            return;

        localStorage.setItem( this.#opts.localStorage_name, buffer2str( buffer ) );      
    }
    async loadFromLocalStorage(name: string) {
        const data = localStorage.getItem(name);
        if( data === null) {
            this.value = null;
            return;
        }

        this.loadFromBuffer( str2buffer( data ), this.value!.filename );
    }


    async saveToBuffer() {

        const value = this.content.value;
        if( value === null)
            return null;

        return await this.#opts.converter.toBuffer(value);
    }
    async loadFromBuffer(buffer: ArrayBuffer, filename:string|null) {
        this.content.value = await this.#opts.converter.fromBuffer( buffer );
        this.value = {...this.value!, filename};
    }
}