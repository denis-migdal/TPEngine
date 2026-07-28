import { WithProperties } from "MWL@2026:exports/Reactive/Properties";

export const baseStyle = __LOAD_FILE__("./index.css");


export function initializeComment(comment: HTMLInputElement,
                                   ctrler: WithProperties<{comment: string}>) {
    comment.value = ctrler.properties.comment;
    comment.addEventListener("input", () => {
        ctrler.properties.comment = comment.value;
    });
}