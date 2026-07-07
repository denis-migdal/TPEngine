import deferredCallback from "MWL@2026:DOM/FrameScheduler/deferredCallback";
import defineWebComponent from "MWL@2026:DOM/WebComponent/defineWebComponent";
import { Signal, Value } from "MWL@2026:Reactive/Properties/Controllers";
import { WithProperties } from "MWL@2026:Reactive/Properties/createProperties";
import { observe } from "MWL@2026:Reactive/Observers/observe";

const Pager = defineWebComponent({
        name      : "wc-pager",
        Controller: WithProperties({
            cur: Value(0),
            max: Signal(0) // each affection triggers a change.
        }),
        content: __LOAD_FILE__("./index.html"),
        elements: {
            prevBtn : HTMLElement,
            nextBtn : HTMLElement,
            curText : HTMLElement,
            maxText  : HTMLElement,
        },
        initialize(ctrler) {

            // TODO use PropertyWatcher...
            observe(ctrler, deferredCallback(this.renderer, () => {
                this.elements.curText.textContent = `${ctrler.properties.cur+1}`;
                this.elements.maxText.textContent = `${ctrler.properties.max}`;
            }));

            // should be in controller but osef.
            this.elements.prevBtn.addEventListener("click", () => {
                let cur = ctrler.properties.cur;
                if( cur === 0)
                    return;

                ctrler.properties.cur = --cur;
            });
            this.elements.nextBtn.addEventListener("click", () => {
                let cur = ctrler.properties.cur;
                if( cur >= ctrler.properties.max - 1)
                    return;

                ctrler.properties.cur = ++cur;
            });
        }
    });

export default Pager;