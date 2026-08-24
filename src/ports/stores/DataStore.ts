import { Codec } from "../codecs/core";
import { Driver, Store } from "./core";
import { BrowserFileDriver } from "./drivers/BrowserFile";
import { IndexDBDriver } from "./drivers/IndexDB";

export class DataStore<T> implements Store<T>{

    readonly driver;
    readonly codec;

    constructor(driver: Driver, codec: Codec<T>) {
        this.driver = driver;
        this.codec  = codec;
    }

    async pick(): Promise<null|Readonly<{name: string, content: T}>> {

        if( this.driver.pick === undefined)
            return null;

        const result = await this.driver.pick();
        if( result === null)
            return null;

        return {
            name   : result.name,
            content: await this.codec.decode(result.buffer),
        } as const;
    }

    async load(key: string): Promise<T|null> {
        const result = await this.driver.read(key);
        if( result === null)
            return null;

        return await this.codec.decode(result);
    }
    async save(key: string, value: T) {
        await this.driver.write(key, await this.codec.encode(value));
    }
}

export function createIndexDBStore<T>(namespace: string, codec: Codec<T>) {
    return new DataStore( new IndexDBDriver(namespace, namespace), codec);
}

export function createBrowserFileStore<T>(codec: Codec<T>) {
    return new DataStore( new BrowserFileDriver(codec.extension), codec);
}