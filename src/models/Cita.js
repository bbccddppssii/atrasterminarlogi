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
exports.TipoCaso = exports.Cita = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const Estudiante_1 = require("./Estudiante");
const Psicologos_1 = require("./Psicologos");
var TipoCaso;
(function (TipoCaso) {
    TipoCaso["AC"] = "academico";
    TipoCaso["SE"] = "socioemocional";
})(TipoCaso || (TipoCaso = {}));
exports.TipoCaso = TipoCaso;
class Cita {
}
__decorate([
    (0, typegoose_1.prop)({ ref: () => Estudiante_1.Estudiante, required: true }),
    __metadata("design:type", Object)
], Cita.prototype, "estudiante", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Date)
], Cita.prototype, "fecha", void 0);
__decorate([
    (0, typegoose_1.prop)({ enum: TipoCaso, required: true }),
    __metadata("design:type", String)
], Cita.prototype, "tipoCaso", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => Psicologos_1.Psicologo }),
    __metadata("design:type", Array)
], Cita.prototype, "psicologosColaboradores", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => Psicologos_1.Psicologo, required: true }),
    __metadata("design:type", Object)
], Cita.prototype, "psicologoPrincipal", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], Cita.prototype, "sesion", void 0);
exports.Cita = Cita;
const CitaModel = (0, typegoose_1.getModelForClass)(Cita, { schemaOptions: { timestamps: true } });
exports.default = CitaModel;
