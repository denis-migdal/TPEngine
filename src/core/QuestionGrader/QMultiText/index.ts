import { defineWebComponent } from "MWL@2026/exports/DOM/WebComponent";
import { baseStyle, initializeComment } from "../core/base";
import { WithProperties } from "MWL@2026/exports/Reactive/Properties";
import { QMultiTextProperties } from "TPEngine@2026/core/Questions/QMultiText";
import { QMultiTextAnswer } from "./Answer";
import { listen } from "MWL@2026/exports/Reactive/Events";

type Answer = WithProperties<{grade: number|null}>

const QMultiText = defineWebComponent({
    name      : "qg-multitext",
    Controller: WithProperties(QMultiTextProperties),
    content   : __LOAD_FILE__("./index.html"),
    style     : [baseStyle, __LOAD_FILE__("./index.css")],
    elements  : {
        answers : HTMLElement,
        comment : HTMLInputElement,
    },
    initialize(ctrler) {

        // no sync: WE are the one pushing changes.
        initializeComment(this.elements.comment, ctrler);

        const answers = ctrler.properties.answer;
        if( answers === null )
            return;

        const grades  = ctrler.properties.scores ?? [];

        const answersElements = new Array<Answer>(answers.length);

        for(let i = 0; i < answers.length; ++i) {

            const answer = answersElements[i] = new QMultiTextAnswer({
                text : answers[i],
                grade: grades[i],
            });

            this.elements.answers.append( answer );
        }

        linkArray(ctrler, answersElements);
    }
});

// unidirectionnal...
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

export {QMultiText};