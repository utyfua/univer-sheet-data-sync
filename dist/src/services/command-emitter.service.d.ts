import { Disposable, ICommand, ICommandInfo, ICommandService } from '@univerjs/core';
import { StateService } from './state.service';
export declare class CommandEmitterService extends Disposable {
    readonly _stateService: StateService;
    private _commandService;
    private before;
    private after;
    constructor(_stateService: StateService, _commandService: ICommandService);
    syncExecuteCommand<Params extends object>(command: ICommand<Params> | string, params?: Params): boolean;
    rerenderWorkbook(): void;
    private onCommandExecuted;
    private registerCommandExecuted;
    registerBeforeCommandExecuted<Params extends object>(command: ICommand<Params> | ICommand<Params>[] | string | string[], handler: (commandInfo: Readonly<ICommandInfo<Params>>) => void): void;
    registerAfterCommandExecuted<Params extends object>(command: ICommand<Params> | ICommand<Params>[] | string | string[], handler: (commandInfo: Readonly<ICommandInfo<Params>>) => void): void;
}
