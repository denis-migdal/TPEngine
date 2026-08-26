import { PropertiesEffects } from "MWL@2026/core/Reactive/PropertySystem/Properties/PropertiesEffects";

export const baseStyle = __LOAD_FILE__("./index.css");

export function initializeMetaRendering(
                            ctx: {
                                readonly target: HTMLElement
                                readonly elements: {
                                    readonly grade: HTMLElement
                                }
                            },
                            effects: PropertiesEffects<{
                                comment: string,
                                score  : null|number,
                                coeff  : null|number,
                            }>,
                            color: boolean) {

    effects.add("comment", () => {
        ctx.target.style.setProperty(
                                        '--comment',
                                        `"${effects.properties.comment}"`
                                    );
    });

    effects.add(["score", "coeff"], () => {

        const grade = ctx.elements.grade;
        const coeff = effects.properties.coeff;

        if( coeff === null) { // not graded.

            if( color )
                ctx.target.style.setProperty("--grade-color", 
                                                "transparent");
            grade.textContent = "";
            return;
        }

        const score = effects.properties.score;

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