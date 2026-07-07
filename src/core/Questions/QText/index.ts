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

export default defineWebComponent({
        name      : "q-text",
        Controller: WithProperties(QTextProperties),
        content: __LOAD_FILE__("./index.html"),
        style  : baseStyle,
        elements: {
            editor: CodeEditor,
            grade : HTMLElement,
        },
        initialize(ctrler) {

            const editor = this.elements.editor;

            syncProperties( ctrler, editor.api,
                            {
                                lang  : "lang",
                                answer: "text"
                            });

            // we could use taskTrigger() here...
            // watchMeta (?).
            observeMeta(this, ctrler, true);
        }
    });