import { StudentWorkCodec } from "TPEngine@2026/ports/codecs/StudentWork";
import { createBrowserFileStore, createIndexDBStore } from "TPEngine@2026/ports/stores/DataStore";

export function getLocalStudentWorkStore() {
    return createIndexDBStore("StudentWork", StudentWorkCodec);
}

export function getExternalStudentWorkStore() {
    return createBrowserFileStore(StudentWorkCodec);
}