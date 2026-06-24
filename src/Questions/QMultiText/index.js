import { InputMerger, LISS, OutputMerger, WithBare, WithContent, WithMeta, WithRWValue, define, getInput, getOutput } from "@LISS/libs/LISS";
const html = __LOAD_FILE__("./index.html");
const css = __LOAD_FILE__("./index.css");
import { css as answer_css, setAnswerColor, setComment, setGlobalGrade } from "../QText/";
class QMultiText extends LISS({ html, css: [answer_css, css] }, WithBare, WithContent, (WithRWValue), (WithMeta)) {
    pts = +this.host.getAttribute("pts");
    nbFields = +this.host.getAttribute("count");
    fields;
    constructor() {
        super();
        const nbCols = +this.host.getAttribute("cols");
        this.host.style.setProperty("--nb_cols", `${nbCols}`);
        const answers = this.content.querySelector(".answer_list");
        this.fields = new Array(this.nbFields);
        for (let i = 0; i < this.nbFields; ++i) {
            const item = document.createElement('div');
            item.append(`(${i + 1})`);
            const field = document.createElement('code-editor');
            field.classList.add("answer", "compact");
            this.fields[i] = field;
            answers.append(item, field);
        }
        const out = new OutputMerger(...this.fields.map(f => getOutput(f)));
        const inp = new InputMerger(...this.fields.map(f => getInput(f)));
        this._output.source = out;
        inp.source = this._input;
        const span_grade = this.content.querySelector('.grade');
        this._meta.listen(() => {
            const meta = this._meta.value;
            setGlobalGrade(span_grade, meta, this.pts, (grade) => grade * this.pts / this.nbFields);
            setComment(answers.parentElement, meta);
            for (let i = 0; i < this.fields.length; ++i)
                setAnswerColor(this.fields[i], meta?.grades[i]);
        });
    }
}
define("q-multitext", QMultiText);
//# sourceMappingURL=index.js.map