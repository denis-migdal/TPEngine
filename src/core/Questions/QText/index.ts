import { CodeEditor } from "MWL@2026/components/code/code-editor";
import { defineWebComponent, createPropertiesDeferredRenderer } from "MWL@2026/exports/DOM/WebComponent";
import { Constant, Value } from "MWL@2026/exports/Reactive/Properties/controllers";
import { WithProperties } from "MWL@2026/exports/Reactive/Properties/";

import { baseStyle, initializeMetaRendering, QProperties } from "../core/base";
import { syncProperties } from "MWL@2026/exports/Reactive/Properties/sync";

// we assume empty string = null, avoid handling this special case.
export const QTextProperties = {
    ...QProperties<string>(""),
    type   : Constant<string>("QText"),
    lang   : Value<string|null>(null),
}

const QText = defineWebComponent({
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

            const propsRenderer = createPropertiesDeferredRenderer(ctrler, this.renderer);
                            
            initializeMetaRendering(this, propsRenderer, true);
        }
    });

export {QText}