import { baseStyle, initializeComment } from "../core/";
import { ARMultiTextAnswerWidget } from "./Answer";
import { defineWidget } from "MWL@2026/core/DOM/Widget";
import { Coordinator, View } from "MWL@2026/exports/DOM/Widget";
import { QMultiTextModel } from "TPEngine@2026/models/Questions";

const ARMultiTextWidget = defineWidget(
    "ar-multitext",
    Coordinator(QMultiTextModel),
    View({
        content   : __LOAD_FILE__("./index.html"),
        style     : [baseStyle, __LOAD_FILE__("./index.css")],
        elements  : {
            answers : HTMLElement,
            comment : HTMLInputElement,
        },
        setup(ctrler) {

            // no sync: WE are the one pushing changes.
            initializeComment(this.elements.comment, ctrler);

            const answers = ctrler.answer;
            if( answers === null )
                return;

            const grades  = ctrler.scores ?? [];

            const answersElements = new Array<ARMultiTextAnswerWidget>(answers.length);

            for(let i = 0; i < answers.length; ++i) {

                const answer = answersElements[i] = new ARMultiTextAnswerWidget({
                    text : answers[i],
                    grade: grades[i],
                });

                this.elements.answers.append( answer );
            }

            //linkArray(ctrler, answersElements);
        }
    })
);

// unidirectionnal...
/*
function linkArray(     list: WithProperties<{scores: readonly number[]|null}>,
                    elements: readonly Answer[]) {
   
    const update = () => {
            const grades = new Array<number>(elements.length);
            for(let i = 0; i < elements.length; ++i)
                grades[i] = elements[i].properties.grade ?? 0;
            
            list.properties.scores = grades;
        }                 
    
    for(let i = 0; i < elements.length; ++i)
        listen(elements[i], update);
}
*/

type ARMultiTextWidget = InstanceType<typeof ARMultiTextWidget>;
export {ARMultiTextWidget};