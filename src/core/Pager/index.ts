import defineWebComponent from "MWL@2026:DOM/WebComponent/defineWebComponent";
import { Signal, Value } from "MWL@2026:Reactive/Properties/Controllers";
import { WithProperties } from "MWL@2026:Reactive/Properties/createProperties";
import { deferredObserve } from "MWL@2026:DOM/FrameScheduler/defer/deferredObserve";

const Pager = defineWebComponent({
        name      : "wc-pager",
        Controller: class extends WithProperties({
            cur: Value(0),
            max: Signal(0) // each affection triggers a change.
        }) {
            prev() {
                let cur = this.properties.cur;
                if( cur === 0)
                    return;

                this.properties.cur = --cur;
            }
            next() {

                let cur = this.properties.cur;
                if( cur >= this.properties.max - 1)
                    return;

                this.properties.cur = ++cur;
            }
        },
        content: __LOAD_FILE__("./index.html"),
        elements: {
            prevBtn : HTMLElement,
            nextBtn : HTMLElement,
            curText : HTMLElement,
            maxText  : HTMLElement,
        },
        initialize(ctrler) {

            deferredObserve(ctrler, this.renderer, () => {
                this.elements.curText.textContent = `${ctrler.properties.cur+1}`;
                this.elements.maxText.textContent = `${ctrler.properties.max}`;
            });

            // should be in controller but osef.
            this.elements.prevBtn.addEventListener("click",
                                                        () => ctrler.prev());
            this.elements.nextBtn.addEventListener("click",
                                                        () => ctrler.next());
        }
    });

export default Pager;