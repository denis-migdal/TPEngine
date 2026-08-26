import { CodeEditor } from "MWL@2026/widgets/code/code-editor";
import {defineWidget, Coordinator, View, DeferredEffects} from "MWL@2026/exports/Widget";
import {bindProperties} from "MWL@2026/exports/Reactive/PropertySystem";
import { QTextModel } from "TPEngine@2026/models/Questions";
import { baseStyle, initializeMetaRendering } from "../core/base";
import { map } from "MWL@2026/core/Reactive/PropertySystem/Properties/sync";

const QTextWidget = defineWidget("q-text",
    Coordinator(QTextModel),
    View({
        content: __LOAD_FILE__("./index.html"),
        style  : baseStyle,
        elements: {
            editor: CodeEditor,
            grade : HTMLElement,
        },
        setup(ctrler) {

            const editor = this.elements.editor;
            bindProperties(ctrler, editor, map("lang", ["answer", "text"]));

            const effects = DeferredEffects(ctrler, this.renderer);
            initializeMetaRendering(this, effects, true);
        }
    }) );

export {QTextWidget}