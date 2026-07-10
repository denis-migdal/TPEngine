import { Fixed, Value } from "MWL@2026:Reactive/Properties/Controllers";
import PropertiesRenderer from "MWL@2026:Reactive/Properties/PropertiesRenderer";

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

export function initializeMetaRendering(
                            ctx: {
                                readonly target: HTMLElement
                                readonly elements: {
                                    readonly grade: HTMLElement
                                }
                            },
                            propsRenderer: PropertiesRenderer<{
                                comment: string,
                                score  : null|number,
                                coeff  : null|number,
                            }>,
                            color: boolean) {

    propsRenderer.bind("comment", () => {
        ctx.target.style.setProperty(
                                        '--comment',
                                        `"${propsRenderer.properties.comment}"`
                                    );
    });

    propsRenderer.bind(["score", "coeff"], () => {

        const grade = ctx.elements.grade;
        const coeff = propsRenderer.properties.coeff;

        if( coeff === null) { // not graded.

            if( color )
                ctx.target.style.setProperty("--grade-color", 
                                                "transparent");
            grade.textContent = "";
            return;
        }

        const score = propsRenderer.properties.score;

        if( color )
            updateGradeColor(ctx.target, score);

        const points = score === null ? "" : `${score*coeff}`;
        ctx.elements.grade.textContent = `[${points}/${coeff}]`;
    });
}

// do not delay: should/could be included in a deferred callback.
export function updateGradeColor(target: HTMLElement, score: number|null) {
    
    let gradeColor = "transparent";
    if( score !== null)
        gradeColor = `hsl(${score * 120}, 100%, 50%)`

    target.style.setProperty("--grade-color", gradeColor);
}