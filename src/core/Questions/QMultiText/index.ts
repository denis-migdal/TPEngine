import defineWebComponent from "MWL@2026:DOM/WebComponent/defineWebComponent";
import { WithProperties } from "MWL@2026:Reactive/Properties/createProperties";
import { baseStyle, initializeMetaRendering, QProperties, updateGradeColor } from "../core/base";
import { Computed, Fixed, Value } from "MWL@2026:Reactive/Properties/Controllers";
import CodeEditor from "MWL@2026:Components/code/code-editor";
import html from "MWL@2026:DOM/ShadowTemplate/parsers/html";
import { watchProperty, watchPropertyChanges } from "MWL@2026:Reactive/Properties/watchProperties";
import { setProperty } from "MWL@2026:Reactive/Properties/createProperties";
import createPropertiesDeferredRenderer from "MWL@2026:DOM/FrameScheduler/defer/createPropertiesDeferredRenderer";

export const QMultiTextProperties = {
    ...QProperties<null|readonly string[]>(null),
    nbFields: Fixed(2),
    nbCols  : Fixed<number|null>(null),
    scores  : Value<readonly number[]|null>(null),
    score   : Computed( (ctx: {scores: readonly number[]|null}) => {
        const scores = ctx.scores;

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

                // bind properties (not UI).
                watchPropertyChanges(fields[i], "text", function() {
                    if( this.origin === ctrler) return;

                    const newAnswer = new Array<string>(nbFields);
                    for(let i = 0; i < nbFields; ++i)
                        newAnswer[i] = fields[i].properties.text;

                    setProperty(ctrler, "answer", newAnswer);
                });
            }

            // bind properties (not UI).
            watchProperty(ctrler, "answer", function() {
                if( this.origin === fields ) return;

                const answer = ctrler.properties.answer;

                for(let i = 0; i < fields.length; ++i)
                    setProperty(fields[i],
                                "text", answer === null ? "" : answer[i],
                                ctrler);
            })

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