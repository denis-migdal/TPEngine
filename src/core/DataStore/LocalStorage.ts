import { buffer2str, str2buffer } from "./core/buffer";
import { DataStore, Serializable } from "./core/interfaces";

//TODO: rework...
export default class LocalStorage extends DataStore {

    readonly prefix: string;

    constructor(target: Serializable, prefix: string) {
        super(target);
        this.prefix = prefix;
    }

    override async read(key: string): Promise<ArrayBuffer|null> {

        const result = localStorage.getItem(`${this.prefix}:${key}`);
        if(result === null)
            return null;

        this.target.resourceName = key;

        return str2buffer(result);
    }

    override async write(buffer: ArrayBuffer, key: string) {
        localStorage.setItem(`${this.prefix}:${key}`, buffer2str(buffer));
    }
}