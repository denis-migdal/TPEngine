import LISS from "@LISS/libs/LISS";

const html = require('!!raw-loader!@TPEngine/Questions/QMultiText/index.html').default;

class QMultiText extends LISS({html})<string> {

    constructor() {
        super();

        const nbFields = +this.host.getAttribute("count")!;
        const nbCols   = +this.host.getAttribute("cols")!;

        this.content.querySelector(".invite")!.textContent = this.host.textContent;

        const answers = this.content.querySelector(".answer")!;
        for(let i = 0; i < nbFields; ++i) {
            //TODO...
            const field = document.createElement('div');
            field.toggleAttribute("contenteditable", true);
            answers.append( field );
        }
    }
}

LISS.define("q-multitext", QMultiText);