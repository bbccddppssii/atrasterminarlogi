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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
let User = class User {
    async comprobarPassword(password) {
        console.log(await bcrypt_1.default.compare(password, this.password));
        return await bcrypt_1.default.compare(password, this.password);
    }
};
__decorate([
    (0, typegoose_1.prop)({ trim: true, required: true }),
    __metadata("design:type", String)
], User.prototype, "nombre", void 0);
__decorate([
    (0, typegoose_1.prop)({ trim: true, required: true }),
    __metadata("design:type", String)
], User.prototype, "apellido", void 0);
__decorate([
    (0, typegoose_1.prop)({ trim: true, required: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typegoose_1.prop)({ trim: true, required: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Object)
], User.prototype, "datosPersonales", void 0);
__decorate([
    (0, typegoose_1.prop)({ enum: ['admin', 'psicologo', 'maestro', 'estudiante'], required: true }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
User = __decorate([
    (0, typegoose_1.modelOptions)({ options: { allowMixed: 0 } })
], User);
exports.User = User;
const UserModel = (0, typegoose_1.getModelForClass)(User, { schemaOptions: { timestamps: true } });
exports.default = UserModel;
