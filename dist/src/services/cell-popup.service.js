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
import { Disposable, Inject, LocaleService } from '@univerjs/core';
import { CellAlertType, CellPopupManagerService, } from '@univerjs/sheets-ui';
import { CommandEmitterService } from './command-emitter.service';
let CellPopupService = class CellPopupService extends Disposable {
    constructor(_commandEmitter, _cellPopupManagerService, _localeService) {
        super();
        Object.defineProperty(this, "_commandEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _commandEmitter
        });
        Object.defineProperty(this, "_cellPopupManagerService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _cellPopupManagerService
        });
        Object.defineProperty(this, "_localeService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _localeService
        });
        Object.defineProperty(this, "_currentDisposable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_destroyProtectionExpireAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _commandEmitter.registerBeforeCommandExecuted('doc.operation.set-selections', this.hidePopup.bind(this));
    }
    showPopup(alert, enableDestroyProtection) {
        if (enableDestroyProtection) {
            this._destroyProtectionExpireAt = Date.now() + 150;
        }
        this._currentDisposable?.dispose();
        this._currentDisposable = this._cellPopupManagerService.showPopup(alert.location, {
            componentKey: 'univer.sheet.cell-alert',
            direction: 'horizontal',
            onClickOutside: this.hidePopup.bind(this),
            extraProps: {
                alert,
            },
            priority: 1,
            showOnSelectionMoving: false,
        });
    }
    hidePopup() {
        if (this._destroyProtectionExpireAt &&
            this._destroyProtectionExpireAt > Date.now())
            return;
        this._destroyProtectionExpireAt = undefined;
        this._currentDisposable?.dispose();
        this._currentDisposable = undefined;
    }
    showProtectedPopup(location) {
        this.showPopup({
            type: CellAlertType.WARNING,
            title: this._localeService.t('communityUniverDataSync.protectedAlert.title'),
            message: this._localeService.t('communityUniverDataSync.protectedAlert.message'),
            location,
            key: 'SHEET_FORCE_STRING_ALERT',
        });
    }
    showFormulaRejectPopup(location) {
        this.showPopup({
            type: CellAlertType.WARNING,
            title: this._localeService.t('communityUniverDataSync.formulaRejectAlert.title'),
            message: this._localeService.t('communityUniverDataSync.formulaRejectAlert.message'),
            location,
            key: 'SHEET_FORCE_STRING_ALERT',
        }, true);
    }
    showInvalidPopup(location, message) {
        this.showPopup({
            type: CellAlertType.WARNING,
            title: this._localeService.t(`dataValidation.panel.invalid`),
            message: this._localeService.t(typeof message === 'string' ? message : `dataValidation.any.error`),
            location,
            key: 'SHEET_FORCE_STRING_ALERT',
        }, true);
    }
};
CellPopupService = __decorate([
    __param(0, Inject(CommandEmitterService)),
    __param(1, Inject(CellPopupManagerService)),
    __param(2, Inject(LocaleService)),
    __metadata("design:paramtypes", [CommandEmitterService,
        CellPopupManagerService,
        LocaleService])
], CellPopupService);
export { CellPopupService };
//# sourceMappingURL=cell-popup.service.js.map