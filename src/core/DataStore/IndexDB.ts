import { buffer2str, str2buffer } from "./core/buffer";
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

    readonly key: string;
    //TODO: ArrayBuffer would be better...
    readonly idb = new IDB<string>("TPEngine", "answers");

    constructor(target: Serializable, key: string) {
        super(target);
        this.key = key;
    }

    override async read(): Promise<ArrayBuffer|null> {

        const result = await this.idb.get(this.key);
        if( result === null )
            return null;

        //TODO: re-réfléchir au filename enregistré.
        // -> stocker "current key" dans localStorage ?
        const data = JSON.parse(result);
        this.target.resourceName = data.name; // meh

        return str2buffer(data.value);
    }

    override async write(buffer: ArrayBuffer) {
        
        const data = JSON.stringify({
            name : this.target.resourceName,
            value: buffer2str(buffer)
        });

        await this.idb.put(this.key, data);
    }
}