import CodeEditor from "MWL@2026:Components/code/code-editor";
import defineWebComponent from "MWL@2026:DOM/WebComponent/defineWebComponent";
import { updateProperties, WithProperties } from "MWL@2026:Reactive/Properties/createProperties";
import { updateGradeColor } from "MWL@2026:TPEngine/Questions/core/base";
import { QTextProperties } from "MWL@2026:TPEngine/Questions/QText";

const QGText = defineWebComponent(
    WithProperties(QTextProperties), {
    name: "qg-text",
    content: __LOAD_FILE__("./index.html"),
    style  : __LOAD_FILE__("./index.css"),
    elements: {
        editor : CodeEditor,
        comment: HTMLInputElement,
        score  : HTMLInputElement,
    },
    initialize: (ctx, ctrler) => {

        // no sync: WE are the one pushing changes.

        const comment = ctx.elements.comment;
        comment.value = ctrler.properties.comment;
        comment.addEventListener("input", () => {
            ctrler.properties.comment = comment.value;
        });

        const scoreInput = ctx.elements.score;

        const score = ctrler.properties.score;
        updateGradeColor(ctx.target, score);
        scoreInput.value = `${score}`;

        scoreInput.addEventListener("input", () => {
            const score = +scoreInput.value;
            ctrler.properties.score = score;
            updateGradeColor(ctx.target, score);
        });

        updateProperties(ctx.elements.editor.properties, {
            lang: ctrler.properties.lang,
            text: ctrler.properties.answer
        });
    }
})

export default QGText;