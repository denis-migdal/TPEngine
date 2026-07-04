import { buffer2str, str2buffer } from "./core/buffer";
import { DataStore, Serializable } from "./core/interfaces";

export default class LocalStorage extends DataStore {

    readonly key: string;

    constructor(target: Serializable, key: string) {
        super(target);
        this.key = key;
    }

    override async read(): Promise<ArrayBuffer|null> {

        const result = localStorage.getItem(this.key);
        if(result === null)
            return null;

        const data = JSON.parse(result);
        this.target.resourceName = data.name; // meh

        return str2buffer(data.value);
    }

    override async write(buffer: ArrayBuffer) {
        
        const data = JSON.stringify({
            name : this.target.resourceName,
            value: buffer2str(buffer)
        });

        localStorage.setItem(this.key, data);
    }
}