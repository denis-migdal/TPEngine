import { CodeEditor } from "MWL@2026/components/code/code-editor";
import { defineWebComponent } from "MWL@2026/exports/DOM/WebComponent";
import { WithProperties } from "MWL@2026/exports/Reactive/Properties";
import { Value } from "MWL@2026/exports/Reactive/Properties/controllers";
import { baseStyle } from "TPEngine@2026/core/QuestionGrader/core/base";

import { updateGradeColor } from "TPEngine@2026/core/Questions/core/base";

const QMultiTextAnswer = defineWebComponent({
    name      : "qg-multitext-answer",
    Controller: WithProperties({
        text : Value<string>(""),
        grade: Value<number|null>(null)
    }),
    content   : __LOAD_FILE__("./index.html"),
    style     : [baseStyle, __LOAD_FILE__("./index.css")],
    elements  : {
        text : CodeEditor,
        grade: HTMLInputElement
    },
    initialize(ctrler) {
        const grade = ctrler.properties.grade;
        if( grade !== null) {
            this.elements.grade.value = `${grade}`;
            updateGradeColor(this.elements.text, grade);
        }

        this.elements.grade.addEventListener('input', () => {
            const grade = +this.elements.grade.value;
            ctrler.properties.grade = grade;
            updateGradeColor(this.elements.text, grade);
        });
    }
});

export {QMultiTextAnswer};