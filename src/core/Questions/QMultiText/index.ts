import defineWebComponent from "MWL@2026:DOM/WebComponent/defineWebComponent";
import { WithProperties } from "MWL@2026:Reactive/Properties/createProperties";
import { baseStyle, observeMeta, QProperties, updateGradeColor } from "../core/base";
import { Computed, Fixed, Value } from "MWL@2026:Reactive/Properties/Controllers";
import CodeEditor from "MWL@2026:Components/code/code-editor";
import html from "MWL@2026:DOM/ShadowTemplate/parsers/html";
import { observeProperty, observePropertyChanges } from "MWL@2026:Reactive/Properties/observeProperties";
import { setProperty } from "MWL@2026:Reactive/Properties/createProperties";

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

export default defineWebComponent(
    WithProperties(QMultiTextProperties),
    {
        name   : "q-multitext",
        content: __LOAD_FILE__("./index.html"),
        style  : [baseStyle, __LOAD_FILE__("./index.css")],
        elements: {
            grade      : HTMLElement,
            answersList: HTMLElement
        },
        initialize: (ctx, ctrler) => {

            const nbFields = ctrler.properties.nbFields;
            let nbCols = ctrler.properties.nbCols ?? nbFields;

            ctx.target.style.setProperty("--nbCols", `${nbCols}`);

            const fields = new Array<InstanceType<typeof CodeEditor>>(nbFields);

            for(let i = 0; i < fields.length; ++i) {
                //TODO: create/init function ?
                const item = html`<div>(${i+1})</div>`;

                const field = new CodeEditor();
                field.classList.add("graded", "compact");

                fields[i] = field;
                ctx.elements.answersList.append( item, field );

                observePropertyChanges(fields[i], "text", function() {
                    if( this.origin === ctrler) return;

                    console.warn('set');

                    const newAnswer = new Array<string>(nbFields);
                    for(let i = 0; i < nbFields; ++i)
                        newAnswer[i] = fields[i].properties.text;

                    setProperty(ctrler, "answer", newAnswer);
                });
            }

            observeProperty(ctrler, "answer", function() {
                if( this.origin === fields ) return;

                const answer = ctrler.properties.answer;

                for(let i = 0; i < fields.length; ++i)
                    setProperty(fields[i],
                                "text", answer === null ? "" : answer[i],
                                ctrler);
            })

            observeMeta(ctx, ctrler, false);

            observeProperty(ctrler, "scores", () => {
                const scores = ctrler.properties.scores;
                
                for(let i = 0; i < fields.length; ++i) {
                    updateGradeColor(fields[i], scores === null ? null : scores[i]);
                }
            });
        }
    });