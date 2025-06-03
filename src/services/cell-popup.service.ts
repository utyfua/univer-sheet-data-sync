import { Disposable, IDisposable, Inject, LocaleService } from '@univerjs/core'
import { ISheetLocationBase } from '@univerjs/sheets'
import {
  CellAlertType,
  CellPopupManagerService,
  ICellAlert,
} from '@univerjs/sheets-ui'
import { CommandEmitterService } from './command-emitter.service'

export class CellPopupService extends Disposable {
  private _currentDisposable: IDisposable | undefined
  private _destroyProtectionExpireAt: number | undefined

  constructor(
    @Inject(CommandEmitterService)
    readonly _commandEmitter: CommandEmitterService,
    @Inject(CellPopupManagerService)
    readonly _cellPopupManagerService: CellPopupManagerService,
    @Inject(LocaleService) readonly _localeService: LocaleService,
  ) {
    super()

    _commandEmitter.registerBeforeCommandExecuted(
      'doc.operation.set-selections',
      this.hidePopup.bind(this),
    )
  }

  showPopup(
    alert: Omit<ICellAlert, 'height' | 'width'>,
    enableDestroyProtection?: boolean,
  ) {
    if (enableDestroyProtection) {
      this._destroyProtectionExpireAt = Date.now() + 150
    }
    this._currentDisposable?.dispose()
    this._currentDisposable = this._cellPopupManagerService.showPopup(
      alert.location,
      {
        componentKey: 'univer.sheet.cell-alert',
        direction: 'horizontal',
        onClickOutside: this.hidePopup.bind(this),
        extraProps: {
          alert,
        },
        priority: 1,
        showOnSelectionMoving: false,
      },
    )
  }

  hidePopup() {
    if (
      this._destroyProtectionExpireAt &&
      this._destroyProtectionExpireAt > Date.now()
    )
      return
    this._destroyProtectionExpireAt = undefined
    this._currentDisposable?.dispose()
    this._currentDisposable = undefined
  }

  showProtectedPopup(location: ISheetLocationBase) {
    this.showPopup({
      type: CellAlertType.WARNING,
      title: this._localeService.t(
        'communityUniverDataSync.protectedAlert.title',
      ),
      message: this._localeService.t(
        'communityUniverDataSync.protectedAlert.message',
      ),
      location,
      key: 'SHEET_FORCE_STRING_ALERT',
    })
  }

  showFormulaRejectPopup(location: ISheetLocationBase) {
    this.showPopup(
      {
        type: CellAlertType.WARNING,
        title: this._localeService.t(
          'communityUniverDataSync.formulaRejectAlert.title',
        ),
        message: this._localeService.t(
          'communityUniverDataSync.formulaRejectAlert.message',
        ),
        location,
        key: 'SHEET_FORCE_STRING_ALERT',
      },
      true,
    )
  }

  showInvalidPopup(location: ISheetLocationBase, message?: string | boolean) {
    this.showPopup(
      {
        type: CellAlertType.WARNING,
        title: this._localeService.t(`dataValidation.panel.invalid`),
        message: this._localeService.t(
          typeof message === 'string' ? message : `dataValidation.any.error`,
        ),
        location,
        key: 'SHEET_FORCE_STRING_ALERT',
      },
      true,
    )
  }
}
