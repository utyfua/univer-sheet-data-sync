import {
  CustomCommandExecutionError,
  Disposable,
  ICommand,
  ICommandInfo,
  ICommandService,
  Inject,
} from '@univerjs/core'
import { SetWorksheetActiveOperation } from '@univerjs/sheets'
import { StateService } from './state.service'

type MapName = 'after' | 'before'

export class CommandEmitterService extends Disposable {
  private before: Map<
    string,
    Array<(commandInfo: Readonly<ICommandInfo<any>>) => void>
  > = new Map()
  private after: Map<
    string,
    Array<(commandInfo: Readonly<ICommandInfo<any>>) => void>
  > = new Map()

  constructor(
    @Inject(StateService) readonly _stateService: StateService,
    @Inject(ICommandService) private _commandService: ICommandService,
  ) {
    super()

    this.disposeWithMe(
      this._commandService.beforeCommandExecuted(
        this.onCommandExecuted.bind(this, 'before'),
      ),
    )

    this.disposeWithMe(
      this._commandService.onCommandExecuted(
        this.onCommandExecuted.bind(this, 'after'),
      ),
    )

    // we dont support moving cells
    this.registerBeforeCommandExecuted(
      [
        'sheet.command.move-cols',
        'sheet.command.move-rows',
        'sheet.command.move-range',
      ],
      () => {
        throw new CustomCommandExecutionError('Cannot move')
      },
    )
  }

  syncExecuteCommand<Params extends object>(
    command: ICommand<Params> | string,
    params?: Params,
  ) {
    const id = typeof command === 'string' ? command : command.id
    return this._commandService.syncExecuteCommand(id, params)
  }

  rerenderWorkbook() {
    const workbook = this._stateService.workbook!
    this.syncExecuteCommand(SetWorksheetActiveOperation, {
      unitId: workbook.getUnitId(),
      subUnitId: workbook.getActiveSheet().getSheetId(),
    })
  }

  private onCommandExecuted(
    mapName: MapName,
    commandInfo: Readonly<ICommandInfo>,
  ) {
    const handlers = this[mapName].get(commandInfo.id)
    handlers?.map((h) => h(commandInfo))
    if (process.env.NODE_ENV === 'development') {
      this[mapName].get('*')?.map((h) => h(commandInfo))
    }
  }

  private registerCommandExecuted<Params extends object>(
    mapName: MapName,
    command: ICommand<Params> | ICommand<Params>[] | string | string[],
    handler: (commandInfo: Readonly<ICommandInfo<Params>>) => void,
  ) {
    const ids = Array.isArray(command)
      ? command.map((c) => (typeof c === 'string' ? c : c.id))
      : typeof command === 'string'
        ? [command]
        : [command.id]

    for (const id of ids) {
      const handlers = this[mapName].get(id)
      if (handlers) {
        handlers.push(handler)
      } else {
        this[mapName].set(id, [handler])
      }
    }
  }

  registerBeforeCommandExecuted<Params extends object>(
    command: ICommand<Params> | ICommand<Params>[] | string | string[],
    handler: (commandInfo: Readonly<ICommandInfo<Params>>) => void,
  ) {
    this.registerCommandExecuted('before', command, handler)
  }

  registerAfterCommandExecuted<Params extends object>(
    command: ICommand<Params> | ICommand<Params>[] | string | string[],
    handler: (commandInfo: Readonly<ICommandInfo<Params>>) => void,
  ) {
    this.registerCommandExecuted('after', command, handler)
  }
}
