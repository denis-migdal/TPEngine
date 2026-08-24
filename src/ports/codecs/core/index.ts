type CodecOpts<T> = {
    extension: string,
    encode: (value: T) => Promise<ArrayBuffer>,
    decode: (bytes: ArrayBuffer) => Promise<T>
}


export class Codec<T> {

    constructor(opts: CodecOpts<T>) {

        this.encode    = opts.encode;
        this.decode    = opts.decode;
        this.extension = opts.extension;
    }

    readonly extension: string;
    readonly encode: (value: T) => Promise<ArrayBuffer>;
    readonly decode: (bytes: ArrayBuffer) => Promise<T>;
}