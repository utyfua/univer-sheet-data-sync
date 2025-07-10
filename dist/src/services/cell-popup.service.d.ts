import { Disposable, LocaleService } from '@univerjs/core';
import { ISheetLocationBase } from '@univerjs/sheets';
import { CellPopupManagerService, ICellAlert } from '@univerjs/sheets-ui';
import { CommandEmitterService } from './command-emitter.service';
export declare class CellPopupService extends Disposable {
    readonly _commandEmitter: CommandEmitterService;
    readonly _cellPopupManagerService: CellPopupManagerService;
    readonly _localeService: LocaleService;
    private _currentDisposable;
    private _destroyProtectionExpireAt;
    constructor(_commandEmitter: CommandEmitterService, _cellPopupManagerService: CellPopupManagerService, _localeService: LocaleService);
    showPopup(alert: Omit<ICellAlert, 'height' | 'width'>, enableDestroyProtection?: boolean): void;
    hidePopup(): void;
    showProtectedPopup(location: ISheetLocationBase): void;
    showFormulaRejectPopup(location: ISheetLocationBase): void;
    showInvalidPopup(location: ISheetLocationBase, message?: string | boolean): void;
}
