import { Fixed, Value } from "MWL@2026:Reactive/Properties/Controllers";
import {type WithProperties} from "MWL@2026:Reactive/Properties/createProperties";
import { observeProperties, observeProperty } from "MWL@2026:Reactive/Properties/observeProperties";

export function QProperties<T>(initialAnswer: T) {
    return {
        QID    : Fixed<string|null>(null),
        comment: Value(""),
        answer : Value(initialAnswer),
        score  : Value<number|null>(null),
        coeff  : Fixed<number|null>(null),
    }
}

export const baseStyle = __LOAD_FILE__("./index.css");


export function observeMeta(ctx: {
                                readonly target: HTMLElement
                                readonly elements: {
                                    readonly grade: HTMLElement
                                }

                            },
                            ctrler: WithProperties<{
                                comment: string,
                                score  : null|number,
                                coeff  : null|number,
                            }>,
                            color: boolean) {

    observeProperty(ctrler, "comment", () => {
        ctx.target.style.setProperty(
                                        '--comment',
                                        `"${ctrler.properties.comment}"`
                                    );
    });

    observeProperties(ctrler, ["score", "coeff"], () => {

        const grade = ctx.elements.grade;
        const coeff = ctrler.properties.coeff;

        if( coeff === null) { // not graded.

            if( color )
                ctx.target.style.setProperty("--grade-color", 
                                                "transparent");
            grade.textContent = "";
            return;
        }

        const score = ctrler.properties.score;

        if( color )
            updateGradeColor(ctx.target, score);

        const points = score === null ? "" : `${score*coeff}`;
        ctx.elements.grade.textContent = `[${points}/${coeff}]`;
    });
}


export function updateGradeColor(target: HTMLElement, score: number|null) {
    
    let gradeColor = "transparent";
    if( score !== null)
        gradeColor = `hsl(${score * 120}, 100%, 50%)`

    target.style.setProperty("--grade-color", gradeColor);
}