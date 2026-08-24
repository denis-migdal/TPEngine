import { setProperties } from "MWL@2026/core/Reactive/PropertySystem/Properties/PropertiesProvider";
import { pauseReactions, resumeReactions, triggerReactiveObject } from "MWL@2026/core/Reactive/PropertySystem/ReactiveObject/ReactiveScheduler";
import { Coordinator, DeferredEffects, defineWidget, View } from "MWL@2026/exports/DOM/Widget";
import { WithProperties } from "MWL@2026/exports/Reactive/PropertySystem/";
import { Value } from "MWL@2026/exports/Reactive/PropertySystem/controllers";

class BoundedCounter extends WithProperties({
        value: Value(0),
        max  : Value(0) //TODO: Output(max).
    }) {

    reset(max: number) {

        pauseReactions(this);

        setProperties<BoundedCounter>(this, {
            value: 0,
            max,
        });

        // ensure trigger.
        triggerReactiveObject(this);

        resumeReactions(this);
    }

    decr() {
        let value = this.value;
        if( value === 0)
            return;

        this.properties.value = --value;
    }
    incr() {

        let value = this.value;
        if( value >= this.max - 1)
            return;

        this.properties.value = ++value;
    }

}

const Pager = defineWidget(
    "w-pager",
    Coordinator(BoundedCounter),
    View({
        content: __LOAD_FILE__("./index.html"),
        elements: {
            prevBtn : HTMLElement,
            nextBtn : HTMLElement,
            curText : HTMLElement,
            maxText  : HTMLElement,
        },
        setup(ctrler) {

            const effects = DeferredEffects(ctrler, this.renderer);

            effects.add("value", () => {
                this.elements.curText.textContent = `${ctrler.value+1}`;
            })
            effects.add("max", () => {
                this.elements.maxText.textContent = `${ctrler.max}`;
            })

            this.elements.prevBtn.addEventListener("click",
                                                        () => ctrler.decr());
            this.elements.nextBtn.addEventListener("click",
                                                        () => ctrler.incr());
        }
    })
);

type Pager = InstanceType<typeof Pager>;

export {Pager};