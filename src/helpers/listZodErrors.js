"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listZodErrors = void 0;
const listZodErrors = (error) => {
    const listError = error.issues.map((e) => {
        return {
            path: e.path,
            message: e.message,
        };
    });
    return listError;
};
exports.listZodErrors = listZodErrors;
