import { str2buffer } from "./core/buffer";
import { DataStore, Serializable } from "./core/interfaces";

// thanks ChatGPT...
class IDB<T = ArrayBuffer> {

    dbPromise: Promise<IDBDatabase>|null = null;

    readonly DBName;
    readonly storeName;

    constructor(DBName: string, storeName: string) {
        this.DBName    = DBName;
        this.storeName = storeName;
    }

    async put(key: string, value: T) {

        const db = await this.getDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");

            tx.objectStore(this.storeName).put(value, key);

            tx.oncomplete = () => resolve();
            tx.onerror    = () => reject(tx.error);
            tx.onabort    = () => reject(tx.error);
        });
    }

    async get(key: string) {

        const db = await this.getDB();

        return new Promise<T|null>((resolve, reject) => {
            const request = db
                .transaction(this.storeName, "readonly")
                .objectStore(this.storeName)
                .get(key);

            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror   = () => reject(request.error);
        });
    }

    protected async getDB() {

        if(this.dbPromise !== null)
            return await this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DBName, 1);

            request.onupgradeneeded = () => {
                request.result.createObjectStore(this.storeName);
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror   = () => reject(request.error);
        });

        return await this.dbPromise;
    }
}

export default class IndexDB extends DataStore {

    //TODO: ArrayBuffer would be better...
    readonly idb;

    constructor(target: Serializable, name: string) {
        super(target);

        // we are forced to use a different dbName in order to have
        // proper/independent upgrade.
        this.idb = new IDB<string|ArrayBuffer>(name, name);
    }

    override async read(key: string): Promise<ArrayBuffer|null> {

        const result = await this.idb.get(key);
        if( result === null )
            return null;

        // old version.
        if( ! (result instanceof ArrayBuffer) )
            return str2buffer(JSON.parse(result).value);

        this.target.resourceName = key;

        return result;
    }

    override async write(buffer: ArrayBuffer, key: string) {
        
        /*
        const data = JSON.stringify({
            name : this.target.resourceName,
            value: buffer2str(buffer)
        });*/

        await this.idb.put(key, buffer);
    }
}