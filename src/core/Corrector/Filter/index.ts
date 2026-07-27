import { html } from "MWL@2026:exports/DOM";
import { ObservableObject, trigger } from "MWL@2026:exports/Reactive/Events";

// we could do a webcomp.
export default class Filter extends ObservableObject {

    value: Record<string, boolean> = {};

    private readonly listArea: HTMLElement;
    private readonly checkAll: HTMLInputElement;

    constructor(listArea: HTMLElement, checkAll: HTMLInputElement) {
        super();

        this.listArea = listArea;
        this.checkAll = checkAll;

        checkAll.addEventListener("click", () => {
            const elements = this.listArea.children;
            for(let i = 0; i < elements.length; ++i) {
                const field = elements[i].querySelector("input")!;
                field.checked = checkAll.checked;
                this.value[field.value!] = checkAll.checked;
            }

            trigger(this);
        });

        this.listArea.addEventListener("click", (ev) => {
            const target = ev.target! as HTMLInputElement;
            if(target.localName !== "input")
                return;

            this.value[target.value] = target.checked;
            trigger(this);
        });
    }

    updateValue() {

        const elements = this.listArea.children;
        for(let i = 0; i < elements.length; ++i) {
            const check = elements[i].querySelector("input")!;
            this.value[check.value] = check.checked;
        }

        trigger(this);
    }

    updateList(list: readonly string[]) {

        this.checkAll.checked = true;

        this.value = {};

        const filter = this.listArea;
        let options = [];
        for(let i = 0; i < list.length; ++i) {
    
            this.value[list[i]] = true;

            const line =
                   html`<div>
                            <input type="checkbox" value="${list[i]}" checked/>
                            ${list[i]}
                        </div>`;
    
            options.push(line);

        }
        
        filter.replaceChildren(...options);

        trigger(this);
    }
}