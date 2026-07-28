import CodeEditor from "MWL@2026:components/code/code-editor";
import {defineWebComponent} from "MWL@2026:exports/DOM/WebComponent";
import { updateProperties, WithProperties } from "MWL@2026:exports/Reactive/Properties";
import { updateGradeColor } from "TPEngine@2026:core/Questions/core/base";
import { QTextProperties }  from "TPEngine@2026:core/Questions/QText";
import { baseStyle, initializeComment } from "../core/base";

const QGText = defineWebComponent({
    name      : "qg-text",
    Controller: WithProperties(QTextProperties),
    content   : __LOAD_FILE__("./index.html"),
    style     : baseStyle,
    elements: {
        editor : CodeEditor,
        comment: HTMLInputElement,
        score  : HTMLInputElement,
    },
    initialize(ctrler) {

        // no sync: WE are the one pushing changes.
        initializeComment(this.elements.comment, ctrler);

        const scoreInput = this.elements.score;

        const score = ctrler.properties.score;
        updateGradeColor(this.target, score);
        scoreInput.value = `${score}`;

        scoreInput.addEventListener("input", () => {
            const score = +scoreInput.value;
            ctrler.properties.score = score;
            updateGradeColor(this.target, score);
        });

        updateProperties(this.elements.editor.properties, {
            lang: ctrler.properties.lang,
            text: ctrler.properties.answer
        });
    }
})

export default QGText;