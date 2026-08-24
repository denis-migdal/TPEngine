import JSZip from "jszip";
import { QuestionModel } from "TPEngine@2026/models/Questions";
import { Codec } from "./core";

//TODO: use /exports/
import { PropertiesShape } from "MWL@2026/core/Reactive/PropertySystem/Properties/PropertiesProvider";

type QuestionData           = PropertiesShape<QuestionModel>;
export type StudentWorkData = {readonly questions: Record<string, QuestionData>};

const FILENAME = "answers";

function replacer(_key: string, value: any) {

    if( value instanceof ArrayBuffer ) {
        return {
            "$type": "ArrayBuffer",
            "value": new Uint8Array(value).toBase64()
        };
    }

    return value;
}

function revival(_key: string, value: any) {
    if( value && typeof value === "object" && "$type" in value) {
        return Uint8Array.fromBase64(value.value).buffer;
    }

    return value;
}

function JSONEncode(object: unknown) {
    return JSON.stringify(object, replacer, '\t');
}

function JSONDecode(object:string) {
    return JSON.parse(object, revival);
}

export const StudentWorkCodec = new Codec({
    extension: ".answers",
    async encode(value: StudentWorkData) {
        const zip = new JSZip();
        zip.file(FILENAME, JSONEncode(value.questions) );

        return await zip.generateAsync({type:"arraybuffer"});
    },
    async decode(bytes: ArrayBuffer): Promise<StudentWorkData> {
        const zip = new JSZip();
        await zip.loadAsync(bytes);

        const file = zip.file(FILENAME)!;
        return {questions: JSONDecode( await file.async("string") )};
    }
});