import CodeEditor from "MWL@2026:Components/code/code-editor";
import defineWebComponent from "MWL@2026:DOM/WebComponent/defineWebComponent";
import { Value } from "MWL@2026:Reactive/Properties/Controllers";
import { WithProperties } from "MWL@2026:Reactive/Properties/createProperties";
import { syncProperties } from "MWL@2026:Reactive/Properties/linkProperties";

import { baseStyle, observeMeta, QProperties } from "../core/base";

// we assume empty string = null, avoid handling this special case.
export const QTextProperties = {
    ...QProperties(""),
    lang   : Value<string|null>(null),
}

export default defineWebComponent(
    WithProperties(QTextProperties),
    {
        name   : "q-text",
        content: __LOAD_FILE__("./index.html"),
        style  : baseStyle,
        elements: {
            editor: CodeEditor,
            grade : HTMLElement,
        },
        initialize: (ctx, ctrler) => {

            const editor = ctx.elements.editor;

            syncProperties( ctrler, editor.controller,
                            {
                                lang  : "lang",
                                answer: "text"
                            });

            observeMeta(ctx, ctrler, true);
        }
    });