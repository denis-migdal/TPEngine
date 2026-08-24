// BrowserFile
import { Driver } from "../core";
import { download } from "../core/download";
import { upload } from "../core/upload";

export class BrowserFileDriver implements Driver {

    readonly extension: string;

    constructor(extension: string) {
        this.extension = extension;
    }

    async pick() {

        const file = await upload(this.extension)
        if(file === null) return null;

        let name = file.name;
        if( name.endsWith(this.extension) )
            name = name.slice(0, - this.extension.length);
        
        return {
            name,
            buffer: await file.arrayBuffer(),
        } as const;
    }

    async read(): Promise<ArrayBuffer|null> {

        const file = await upload(this.extension)
        if(file === null) return null;
        
        return await file.arrayBuffer();
    }

    async write(key: string, buffer: ArrayBuffer) {
        
        download(
                    buffer,
                    key + this.extension,
                    this.extension
                );
    }
}