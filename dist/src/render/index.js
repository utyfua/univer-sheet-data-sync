var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Disposable, Inject, Injector } from '@univerjs/core';
import { ProtectedCellsRenderExtension } from './protected-cells.render';
let RenderExtension = class RenderExtension extends Disposable {
    constructor(_context, _injector) {
        super();
        Object.defineProperty(this, "_context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _context
        });
        Object.defineProperty(this, "_injector", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _injector
        });
        const mainComponent = this._context.mainComponent;
        if (!mainComponent)
            throw new Error('Main component is not defined in the render context');
        const protectedCells = this._injector.createInstance(ProtectedCellsRenderExtension);
        this.disposeWithMe(mainComponent.register(protectedCells));
    }
};
RenderExtension = __decorate([
    __param(1, Inject(Injector)),
    __metadata("design:paramtypes", [Object, Injector])
], RenderExtension);
export { RenderExtension };
//# sourceMappingURL=index.js.map