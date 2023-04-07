"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function transformUpdateEstudiante(data) {
    const transformedData = { $set: {} };
    for (const key in data) {
        if (key === "datosPersonales") {
            for (const innerKey in data[key]) {
                transformedData.$set[`datosPersonales.${innerKey}`] = data[key][innerKey];
            }
        }
        else {
            transformedData.$set[key] = data[key];
        }
    }
    return transformedData;
}
exports.default = transformUpdateEstudiante;
