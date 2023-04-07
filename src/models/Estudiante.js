"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Estudiante = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const User_1 = require("./User");
let DatosPersonalesEstudiante = class DatosPersonalesEstudiante {
};
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Number)
], DatosPersonalesEstudiante.prototype, "codigo", void 0);
__decorate([
    (0, typegoose_1.prop)({ enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] }),
    __metadata("design:type", String)
], DatosPersonalesEstudiante.prototype, "seccion", void 0);
__decorate([
    (0, typegoose_1.prop)({ enum: ['DSW', 'ATPS', 'ECA', 'EMCA', 'MNTO', 'DG'] }),
    __metadata("design:type", String)
], DatosPersonalesEstudiante.prototype, "especialidad", void 0);
__decorate([
    (0, typegoose_1.prop)({ enum: [0, 1, 2, 3] }),
    __metadata("design:type", Number)
], DatosPersonalesEstudiante.prototype, "nivelBachiller", void 0);
DatosPersonalesEstudiante = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { _id: false } })
], DatosPersonalesEstudiante);
let Estudiante = class Estudiante extends User_1.User {
};
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", DatosPersonalesEstudiante)
], Estudiante.prototype, "datosPersonales", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Estudiante.prototype, "defaultPassword", void 0);
Estudiante = __decorate([
    (0, typegoose_1.modelOptions)({ options: { allowMixed: 0 } })
], Estudiante);
exports.Estudiante = Estudiante;
const EstudianteModel = (0, typegoose_1.getModelForClass)(Estudiante, { schemaOptions: { timestamps: true } });
exports.default = EstudianteModel;
