// can't use Uint16Array (a shame...)
export function buffer2str(array: ArrayBuffer) {

    return String.fromCharCode(... new Uint8Array(array) );
}
export function str2buffer(str: string) {

    const buffer = new Uint8Array(str.length);

    for(let i = 0; i < str.length; ++i)
        buffer[i] = str.charCodeAt(i);

    return buffer.buffer;
}