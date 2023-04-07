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
exports.Sesiones = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const Cita_1 = require("./Cita");
const Estudiante_1 = require("./Estudiante");
const Psicologos_1 = require("./Psicologos");
class Sesiones {
}
__decorate([
    (0, typegoose_1.prop)({ ref: () => Estudiante_1.Estudiante, required: true }),
    __metadata("design:type", Object)
], Sesiones.prototype, "estudiante", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => Cita_1.Cita }),
    __metadata("design:type", Array)
], Sesiones.prototype, "citas", void 0);
__decorate([
    (0, typegoose_1.prop)({ trim: true, required: true, enum: ["asesoria_psicopedagogica", "orientacion_pedagogica", "orientacion_vocacional", "apoyo_academico", "apoyo_socioemocional"] }),
    __metadata("design:type", String)
], Sesiones.prototype, "tipo", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => Psicologos_1.Psicologo, required: true }),
    __metadata("design:type", Object)
], Sesiones.prototype, "psicologo", void 0);
exports.Sesiones = Sesiones;
const SesionesModel = (0, typegoose_1.getModelForClass)(Sesiones, { schemaOptions: { timestamps: true } });
exports.default = SesionesModel;
