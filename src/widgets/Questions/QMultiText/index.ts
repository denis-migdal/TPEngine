import { html } from "MWL@2026/exports/DOM/";
import { CodeEditor } from "MWL@2026/widgets/code/code-editor";

import { baseStyle, initializeMetaRendering, updateGradeColor } from "../core/base";
import { Coordinator, DeferredEffects, defineWidget, View } from "MWL@2026/exports/Widget";
import { QMultiTextModel } from "TPEngine@2026/models/Questions";
import { Property } from "MWL@2026/core/Reactive/PropertySystem/Property/Property";
import { getProperty } from "MWL@2026/core/Reactive/PropertySystem/Properties/PropertiesProvider";
import { REACTIVE_NODE } from "MWL@2026/core/Reactive/PropertySystem/ReactiveObject/ReactiveObject";
import { RWPropertyController } from "MWL@2026/core/Reactive/PropertySystem/Property/PropertyController";

const QMultiTextWidget = defineWidget(
    "q-multitext",
    Coordinator(QMultiTextModel),
    View({
        content: __LOAD_FILE__("./index.html"),
        style  : [baseStyle, __LOAD_FILE__("./index.css")],
        elements: {
            grade      : HTMLElement,
            answersList: HTMLElement
        },
        setup(ctrler) {


            const nbFields = ctrler.nbFields;
            const   nbCols = ctrler.nbCols ?? nbFields;

            this.target.style.setProperty("--nbCols", `${nbCols}`);

            const fields = new Array<CodeEditor>(nbFields);
            const texts  = new Array<Property<string>>(nbFields);

            for(let i = 0; i < fields.length; ++i) {
                //TODO: create/init function ?
                const item = html`<div>(${i+1})</div>`;

                const field = new CodeEditor();
                field.classList.add("graded", "compact");

                fields [i] = field;
                texts[i] = getProperty(field, "text");

                this.elements.answersList.append( item, field );
            }

            const answers = getProperty(ctrler, "answer");

            //TODO: debug...
            link1_N( answers, texts, (array, idx) => {
                if( array === null) return "";

                return array[idx];
            });
            linkN_1( texts, answers, (array) => array);

            // UI...
            const effects = DeferredEffects(ctrler, this.renderer);

            initializeMetaRendering(this, effects, false);

            effects.add("scores", () => {

                const scores = ctrler.properties.scores;
                
                for(let i = 0; i < fields.length; ++i) {
                    updateGradeColor(fields[i], scores === null ? null : scores[i]);
                }
            });
        }
    })
);

function linkN_1<T, U>(
            src: readonly Property<T>[],
            dst: Property<U>,
            merge: (v: readonly T[]) => U
    ) {

    for(let i = 0; i < src.length; ++i)
        src[i][REACTIVE_NODE].links.push({
            src: src[i],
            dst: dst,
            //TODO: avoid fct creation
            propagate(){
                const result = merge(src.map( s => s.get() ));

                //TODO: fct
                (dst.controller as RWPropertyController<any>).clearValue();

                //TODO: avoid obj creation
                dst.value = {
                    get() {
                        return result;
                    }
                }
            }
        })

}

function link1_N<T, U>(
            src: Property<T>,
            dst: readonly Property<U>[],
            callback: (v: T, idx: number) => U 
        ) {

    for(let i = 0; i < dst.length; ++i)
        src[REACTIVE_NODE].links.push({
            src,
            dst: dst[i],
            //TODO: avoid fct creation
            propagate() {

                //TODO: fct
                (dst[i].controller as RWPropertyController<any>).clearValue();

                //TODO: avoid obj creation
                //TODO: cache ?
                dst[i].value = {
                    get() {
                        return callback(src.get(), i)
                    }
                }
            },
        });
}

export {QMultiTextWidget};