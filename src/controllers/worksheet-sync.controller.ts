import { Disposable, Inject } from '@univerjs/core'
import { ISyncOptions, NewRowBase } from '../interfaces'
import {
  IWorksheetDataPartial,
  SnapshotService,
} from '../services/snapshot.service'
import { StateService } from '../services/state.service'

export class WorksheetSyncController<
  Row = unknown,
  NewRow extends object | false = NewRowBase | false,
> extends Disposable {
  constructor(
    private id: string,
    @Inject(SnapshotService) private _snapshotService: SnapshotService,
    @Inject(StateService) private _stateService: StateService,
  ) {
    super()
  }

  updateUniverWorksheet(worksheet: IWorksheetDataPartial) {
    worksheet.id = this.id
    this._snapshotService.upsertUniverWorksheet(worksheet)
  }

  setDataModel(syncOptions: ISyncOptions<Row, NewRow>) {
    this._snapshotService.setWorksheetSyncDataModel(
      this.id,
      syncOptions as ISyncOptions,
    )
  }

  getDataModel(): Readonly<ISyncOptions<Row, NewRow> | undefined> {
    return this._stateService.getState(this.id)?.syncOptions as ISyncOptions<Row, NewRow> | undefined
  }
}
