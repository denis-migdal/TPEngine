export interface Serializable {
    import(buffer: ArrayBuffer, origin: unknown): Promise<void>;
    export(): Promise<ArrayBuffer>;

    resourceName: string;
}

export abstract class DataStore {

    readonly target: Serializable;

    constructor(target: Serializable) {
        this.target = target;
    }

    // returns false if wasn't able to read.
    // e.g. localStorage doesn't exists, operation canceled, etc.
    async load(key: string = this.target.resourceName): Promise<void|false> {

        const buffer = await this.read(key);
        if( buffer === null) return false;

        await this.target.import( buffer, this );
    }
    async save(key: string = this.target.resourceName) {
        await this.write(
                            await this.target.export(),
                            key
                        );
    }

    // low level - mainly for test/debug purpose.
    // be careful, can modify/use target.ressourceName !
    protected abstract read(key: string): Promise<ArrayBuffer|null>;
    protected abstract write(buffer: ArrayBuffer, key:string): Promise<void>;
}