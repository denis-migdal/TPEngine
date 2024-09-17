
export function buffer2hex(array: ArrayBuffer) {

    // @ts-ignore
    return [...new Uint8Array(array)].map( byte => (byte).toString(16).padStart(2, '0')).join("");
}

export function hex2buffer(str: string) {

    let array = new Array(str.length / 2);
    for(let i = 0; i < array.length; ++i)
        array[i] = parseInt( str[2*i]+str[2*i+1], 16);

    return Uint8Array.from( array ).buffer;
}