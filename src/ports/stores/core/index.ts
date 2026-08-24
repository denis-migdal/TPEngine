export interface Store<T> {
    load(key: string): Promise<T|null>;
    save(key: string, value: T): Promise<void>;
}

export interface Driver {
    read(key: string): Promise<ArrayBuffer|null>;
    write(key: string, bytes: ArrayBuffer): Promise<void>;

    pick?(): Promise<null|{name: string, buffer: ArrayBuffer}>
}