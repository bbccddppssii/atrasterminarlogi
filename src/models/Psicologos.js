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
exports.Psicologo = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const User_1 = require("./User");
let DatosPersonalesPsicologo = class DatosPersonalesPsicologo {
};
__decorate([
    (0, typegoose_1.prop)({ enum: ["bachillerato"] }),
    __metadata("design:type", String)
], DatosPersonalesPsicologo.prototype, "nivelAcademico", void 0);
DatosPersonalesPsicologo = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { _id: false } })
], DatosPersonalesPsicologo);
let Psicologo = class Psicologo extends User_1.User {
};
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", DatosPersonalesPsicologo)
], Psicologo.prototype, "datosPersonales", void 0);
Psicologo = __decorate([
    (0, typegoose_1.modelOptions)({ options: { allowMixed: 0 } })
], Psicologo);
exports.Psicologo = Psicologo;
const PsicologoModel = (0, typegoose_1.getModelForClass)(Psicologo, { schemaOptions: { timestamps: true } });
exports.default = PsicologoModel;
