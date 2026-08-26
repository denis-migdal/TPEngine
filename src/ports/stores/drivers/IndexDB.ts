import { str2buffer } from "../core/buffer";
import { Driver } from "../core";

// thanks ChatGPT...
export class IndexDBDriver implements Driver {

    readonly DBName;
    readonly storeName;

    constructor(DBName: string, storeName: string = DBName) {
        this.DBName    = DBName;
        this.storeName = storeName;
    }

    async write(key: string, bytes: ArrayBuffer) {

        const db = await this.getDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");

            tx.objectStore(this.storeName).put(bytes, key);

            tx.oncomplete = () => resolve();
            tx.onerror    = () => reject(tx.error);
            tx.onabort    = () => reject(tx.error);
        });
    }

    async read(key: string) {

        const db = await this.getDB();

        return new Promise<ArrayBuffer|null>((resolve, reject) => {
            const request = db
                .transaction(this.storeName, "readonly")
                .objectStore(this.storeName)
                .get(key);

            request.onsuccess = () => {
                let result = request.result ?? null;

                // Compat. old version.
                if( result !== null && ! (result instanceof ArrayBuffer) )
                    result = str2buffer(JSON.parse(result).value);

                resolve(result);
            };
            request.onerror   = () => reject(request.error);
        });
    }

    protected dbPromise: Promise<IDBDatabase>|null = null;
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