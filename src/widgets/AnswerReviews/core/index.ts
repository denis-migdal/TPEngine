import { WidgetCstr } from "MWL@2026/exports/Widget";
import { WithProperties } from "MWL@2026/exports/Reactive/PropertySystem";

type ARWidgetCstr = WidgetCstr<{readonly type: string}>;

export const AnswerReviewRegistry: Record<string, ARWidgetCstr> = {};

export const baseStyle = __LOAD_FILE__("./index.css");

export function initializeComment(comment: HTMLInputElement,
                                   ctrler: WithProperties<{comment: string}>) {
    comment.value = ctrler.properties.comment;
    comment.addEventListener("input", () => {
        ctrler.properties.comment = comment.value;
    });
}