import taskTrigger from "MWL@2026:DOM/FrameScheduler/taskTrigger";
import defineWebComponent from "MWL@2026:DOM/WebComponent/defineWebComponent";
import { Signal, Value } from "MWL@2026:Reactive/Properties/Controllers";
import { WithProperties } from "MWL@2026:Reactive/Properties/createProperties";
import { observe } from "MWL@2026:Reactive/Observers/observe";

const Pager = defineWebComponent(
    WithProperties({
        cur: Value(0),
        max: Signal(0) // each affection triggers a change.
    }),
    {
        name   : "wc-pager",
        content: __LOAD_FILE__("./index.html"),
        elements: {
            prevBtn : HTMLElement,
            nextBtn : HTMLElement,
            curText : HTMLElement,
            maxText  : HTMLElement,
        },
        initialize: (ctx, ctrler, renderer) => {

            observe(ctrler, taskTrigger(renderer, () => {
                ctx.elements.curText.textContent = `${ctrler.properties.cur+1}`;
                ctx.elements.maxText.textContent = `${ctrler.properties.max}`;
            }));

            // should be in controller but osef.
            ctx.elements.prevBtn.addEventListener("click", () => {
                let cur = ctrler.properties.cur;
                if( cur === 0)
                    return;

                ctrler.properties.cur = --cur;
            });
            ctx.elements.nextBtn.addEventListener("click", () => {
                let cur = ctrler.properties.cur;
                if( cur >= ctrler.properties.max - 1)
                    return;

                ctrler.properties.cur = ++cur;
            });
        }
    });

export default Pager;