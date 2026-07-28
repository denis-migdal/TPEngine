import { html } from "MWL@2026:exports/DOM/";
import { defineWebComponent, createPropertiesDeferredRenderer } from "MWL@2026:exports/DOM/WebComponent";
import { updateProperties, WithProperties } from "MWL@2026:exports/Reactive/Properties";
import { Constant, Fixed, Value, View } from "MWL@2026:exports/Reactive/Properties/controllers";
import CodeEditor from "MWL@2026:components/code/code-editor";

import { baseStyle, initializeMetaRendering, QProperties, updateGradeColor } from "../core/base";
import { listen, observe } from "MWL@2026:core/Reactive/Observers";

export const QMultiTextProperties = {
    ...QProperties<null|readonly string[]>(null),
    type    : Constant<string>("QMultiText"),
    nbFields: Fixed<number>(2),
    nbCols  : Fixed<number|null>(null),
    scores  : Value<readonly number[]|null>(null),
    score   : View("scores", (scores: readonly number[]|null) => {

        if( scores === null)
            return null;

        let sum = 0;
        for(let i = 0; i < scores.length; ++i)
            sum += scores[i]

        return sum / scores.length;
    }),
}

export default defineWebComponent({
        name      : "q-multitext",
        Controller: WithProperties(QMultiTextProperties),
        content: __LOAD_FILE__("./index.html"),
        style  : [baseStyle, __LOAD_FILE__("./index.css")],
        elements: {
            grade      : HTMLElement,
            answersList: HTMLElement
        },
        initialize(ctrler) {

            const nbFields = ctrler.properties.nbFields;
            const   nbCols = ctrler.properties.nbCols ?? nbFields;

            this.target.style.setProperty("--nbCols", `${nbCols}`);

            const fields = new Array<InstanceType<typeof CodeEditor>>(nbFields);

            for(let i = 0; i < fields.length; ++i) {
                //TODO: create/init function ?
                const item = html`<div>(${i+1})</div>`;

                const field = new CodeEditor();
                field.classList.add("graded", "compact");

                fields[i] = field;
                this.elements.answersList.append( item, field );
            }

            // sync properties (not UI).
            syncArray(ctrler, fields);

            // UI...
            const propsRenderer = createPropertiesDeferredRenderer(ctrler, this.renderer);

            initializeMetaRendering(this, propsRenderer, false);

            propsRenderer.bind("scores", () => {

                const scores = ctrler.properties.scores;
                
                for(let i = 0; i < fields.length; ++i) {
                    updateGradeColor(fields[i], scores === null ? null : scores[i]);
                }
            });
        }
    });

//TODO: necessitate:
    // List sync
    // Properties sync.
function syncArray(     list: WithProperties<{answer: readonly string[]|null}>,
                    elements: readonly WithProperties<{text: string}>[]) {

    // should watch "answer"
    for(let i = 0; i < elements.length; ++i) {
        listen(elements[i], function() {

            if( this.origin === list) return;

            const newAnswer = new Array<string>(elements.length);
            for(let i = 0; i < elements.length; ++i)
                newAnswer[i] = elements[i].properties.text;

            updateProperties(list, {answer: newAnswer}, elements);
        });
    }

    // should watch "answer"
    observe(list, function() {

        if( this.origin === elements ) return;

        const answer = list.properties.answer;

        for(let i = 0; i < elements.length; ++i)
            updateProperties(elements[i],
                        {text: answer === null ? "" : answer[i]},
                        list);
    });
}