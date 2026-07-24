import CodeEditor from "MWL@2026:components/code/code-editor";
import {defineWebComponent} from "MWL@2026:exports/DOM/WebComponent";
import { updateProperties, WithProperties } from "MWL@2026:exports/Reactive/Properties";
import { updateGradeColor } from "TPEngine@2026:core/Questions/core/base";
import { QTextProperties }  from "TPEngine@2026:core/Questions/QText";

const QGText = defineWebComponent({
    name      : "qg-text",
    Controller: WithProperties(QTextProperties),
    content   : __LOAD_FILE__("./index.html"),
    style     : __LOAD_FILE__("./index.css"),
    elements: {
        editor : CodeEditor,
        comment: HTMLInputElement,
        score  : HTMLInputElement,
    },
    initialize(ctrler) {

        // no sync: WE are the one pushing changes.

        const comment = this.elements.comment;
        comment.value = ctrler.properties.comment;
        comment.addEventListener("input", () => {
            ctrler.properties.comment = comment.value;
        });

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