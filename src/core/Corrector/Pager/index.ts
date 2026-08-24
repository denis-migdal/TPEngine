import {createPropertiesDeferredRenderer, defineWebComponent} from "MWL@2026/exports/DOM/WebComponent";
import { Signal, Value } from "MWL@2026/exports/Reactive/Properties/controllers";
import { WithProperties } from "MWL@2026/exports/Reactive/Properties/";

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

            const renderer = createPropertiesDeferredRenderer(ctrler, this.renderer);

            renderer.bind("cur", () => {
                this.elements.curText.textContent = `${ctrler.properties.cur+1}`;
            })
            renderer.bind("max", () => {
                this.elements.maxText.textContent = `${ctrler.properties.max}`;
            })

            // should be in controller but osef.
            this.elements.prevBtn.addEventListener("click",
                                                        () => ctrler.prev());
            this.elements.nextBtn.addEventListener("click",
                                                        () => ctrler.next());
        }
    });

export {Pager};