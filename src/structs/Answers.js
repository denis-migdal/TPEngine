const JSZip = require("jszip");
export async function Answers2Buffer(data) {
    const zip = new JSZip();
    zip.file("answers", JSON.stringify(data, null, '\t'));
    return await zip.generateAsync({ type: "arraybuffer" });
}
export async function Buffer2Answers(content) {
    const zip = new JSZip();
    await zip.loadAsync(content);
    const file = zip.file("answers");
    //console.warn(file.date);
    return JSON.parse(await file.async("string"));
}
export const AnswersConv = {
    toBuffer: Answers2Buffer,
    fromBuffer: Buffer2Answers
};
//# sourceMappingURL=Answers.js.map