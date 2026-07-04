// BrowserFile
import { download } from "./core/download";
import { DataStore, Serializable } from "./core/interfaces";
import { upload } from "./core/upload";

export default class BrowserFile extends DataStore {

    readonly extension: string;
    readonly defaultName: string|null = null;

    constructor(target       : Serializable,
                extension    : string,
                defaultName  : string|null = null) {
        super(target);
        this.extension = extension;
        this.defaultName = defaultName;
    }

    override async read(): Promise<ArrayBuffer|null> {

        const file = await upload(this.extension)
        if(file === null) return null;

        this.target.resourceName = file.name;
        
        return await file.arrayBuffer();
    }

    override async write(buffer: ArrayBuffer) {
        
        download( buffer, this.defaultName ?? this.target.resourceName,
                    this.extension);
    }
}