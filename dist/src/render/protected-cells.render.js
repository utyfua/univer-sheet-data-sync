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
import { Inject } from '@univerjs/core';
import { SheetExtension, } from '@univerjs/engine-render';
import { PROTECTED_CELL_BASE64_DARK, PROTECTED_CELL_BASE64_LIGHT, } from '../resources/protected-cell-base64';
import { StateService } from '../services/state.service';
let ProtectedCellsRenderExtension = class ProtectedCellsRenderExtension extends SheetExtension {
    constructor(_stateService) {
        super();
        Object.defineProperty(this, "_stateService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _stateService
        });
        Object.defineProperty(this, "uKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'SHEET_DATA_SYNC_PROTECT_BACKGROUND'
        });
        Object.defineProperty(this, "Z_INDEX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 25
        });
        Object.defineProperty(this, "_img", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_pattern", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        const light = (this._img[0] = new Image());
        light.src = PROTECTED_CELL_BASE64_LIGHT;
        const dark = (this._img[1] = new Image());
        dark.src = PROTECTED_CELL_BASE64_DARK;
    }
    applyFillStyle(ctx) {
        const isDarkMode = +this._stateService.darkMode;
        let pattern = this._pattern[isDarkMode];
        if (!pattern) {
            const img = this._img[isDarkMode];
            pattern = this._pattern[isDarkMode] = ctx.createPattern(img, 'repeat');
        }
        ctx.fillStyle = pattern;
    }
    draw(ctx, _parentScale, spreadsheetSkeleton) {
        const { worksheet } = spreadsheetSkeleton;
        const state = this._stateService.getState(worksheet.getSheetId());
        if (!worksheet || !state) {
            return;
        }
        ctx.save();
        this.applyFillStyle(ctx);
        const fillCell = (row, column) => {
            if (!worksheet.getRowVisible(row) || !worksheet.getColVisible(column))
                return;
            const coords = spreadsheetSkeleton.getCellWithCoordByIndex(row, column, false);
            ctx.fillRect(coords.startX, coords.startY, coords.endX - coords.startX, coords.endY - coords.startY);
        };
        state.matrix.forValue((row, column, data) => {
            const syncData = data?.syncRef?.().syncData;
            if (!syncData || syncData?.isProtected) {
                fillCell(row, column);
            }
        });
        ctx.restore();
    }
};
ProtectedCellsRenderExtension = __decorate([
    __param(0, Inject(StateService)),
    __metadata("design:paramtypes", [StateService])
], ProtectedCellsRenderExtension);
export { ProtectedCellsRenderExtension };
//# sourceMappingURL=protected-cells.render.js.map