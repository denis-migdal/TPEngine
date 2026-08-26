import { CodeEditor } from "MWL@2026/widgets/code/code-editor";
import { defineWidget, Coordinator, View } from "MWL@2026/exports/Widget";
import { WithProperties } from "MWL@2026/exports/Reactive/PropertySystem";
import { Value } from "MWL@2026/exports/Reactive/PropertySystem/controllers";
import { baseStyle } from "../../core/";
import { updateGradeColor } from "TPEngine@2026/widgets/Questions/core/base";

const Model = WithProperties({
    text : Value<string>(""),
    grade: Value<number|null>(null)
})

const ARMultiTextAnswerWidget = defineWidget(
    "ar-multitext-answer",
    Coordinator(Model),
    View({
        content   : __LOAD_FILE__("./index.html"),
        style     : [baseStyle, __LOAD_FILE__("./index.css")],
        elements  : {
            text : CodeEditor,
            grade: HTMLInputElement
        },
        setup(ctrler) {
            const grade = ctrler.grade;
            if( grade !== null) {
                this.elements.grade.value = `${grade}`;
                updateGradeColor(this.elements.text, grade);
            }

            this.elements.grade.addEventListener('input', () => {
                const grade = +this.elements.grade.value;
                ctrler.grade = grade;
                updateGradeColor(this.elements.text, grade);
            });
        }
    })
);

type ARMultiTextAnswerWidget = InstanceType<typeof ARMultiTextAnswerWidget>;

export {ARMultiTextAnswerWidget};