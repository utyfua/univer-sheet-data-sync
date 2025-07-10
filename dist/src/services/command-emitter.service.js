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
import { CustomCommandExecutionError, Disposable, ICommandService, Inject, } from '@univerjs/core';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { StateService } from './state.service';
let CommandEmitterService = class CommandEmitterService extends Disposable {
    constructor(_stateService, _commandService) {
        super();
        Object.defineProperty(this, "_stateService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _stateService
        });
        Object.defineProperty(this, "_commandService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _commandService
        });
        Object.defineProperty(this, "before", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "after", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.disposeWithMe(this._commandService.beforeCommandExecuted(this.onCommandExecuted.bind(this, 'before')));
        this.disposeWithMe(this._commandService.onCommandExecuted(this.onCommandExecuted.bind(this, 'after')));
        // we dont support moving cells
        this.registerBeforeCommandExecuted([
            'sheet.command.move-cols',
            'sheet.command.move-rows',
            'sheet.command.move-range',
        ], () => {
            throw new CustomCommandExecutionError('Cannot move');
        });
    }
    syncExecuteCommand(command, params) {
        const id = typeof command === 'string' ? command : command.id;
        return this._commandService.syncExecuteCommand(id, params);
    }
    rerenderWorkbook() {
        const workbook = this._stateService.workbook;
        this.syncExecuteCommand(SetWorksheetActiveOperation, {
            unitId: workbook.getUnitId(),
            subUnitId: workbook.getActiveSheet().getSheetId(),
        });
    }
    onCommandExecuted(mapName, commandInfo) {
        const handlers = this[mapName].get(commandInfo.id);
        handlers?.map((h) => h(commandInfo));
        if (process.env.NODE_ENV === 'development') {
            this[mapName].get('*')?.map((h) => h(commandInfo));
        }
    }
    registerCommandExecuted(mapName, command, handler) {
        const ids = Array.isArray(command)
            ? command.map((c) => (typeof c === 'string' ? c : c.id))
            : typeof command === 'string'
                ? [command]
                : [command.id];
        for (const id of ids) {
            const handlers = this[mapName].get(id);
            if (handlers) {
                handlers.push(handler);
            }
            else {
                this[mapName].set(id, [handler]);
            }
        }
    }
    registerBeforeCommandExecuted(command, handler) {
        this.registerCommandExecuted('before', command, handler);
    }
    registerAfterCommandExecuted(command, handler) {
        this.registerCommandExecuted('after', command, handler);
    }
};
CommandEmitterService = __decorate([
    __param(0, Inject(StateService)),
    __param(1, Inject(ICommandService)),
    __metadata("design:paramtypes", [StateService, Object])
], CommandEmitterService);
export { CommandEmitterService };
//# sourceMappingURL=command-emitter.service.js.map