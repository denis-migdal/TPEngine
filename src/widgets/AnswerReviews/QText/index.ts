import { updateProperties } from "MWL@2026/exports/Reactive/PropertySystem";
import { AnswerReviewRegistry, baseStyle, initializeComment } from "../core/";
import { defineWidget, Coordinator, View } from "MWL@2026/exports/Widget";
import { updateGradeColor } from "TPEngine@2026/widgets/Questions/core/base";
import { QTextModel } from "TPEngine@2026/models/Questions";
import { CodeEditor } from "MWL@2026/widgets/code/code-editor";

const ARTextWidget = defineWidget(
    "ar-text",
    Coordinator(QTextModel),
    View({
        content   : __LOAD_FILE__("./index.html"),
        style     : baseStyle,
        elements: {
            editor : CodeEditor,
            comment: HTMLInputElement,
            score  : HTMLInputElement,
        },
        setup(ctrler) {

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

            updateProperties(this.elements.editor, {
                lang: ctrler.properties.lang,
                text: ctrler.properties.answer
            });
        }
    }),
);

type ARTextWidget = InstanceType<typeof ARTextWidget>;

export {ARTextWidget};

AnswerReviewRegistry["QText"] = ARTextWidget;