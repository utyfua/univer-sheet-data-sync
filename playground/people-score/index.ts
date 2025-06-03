import { workbookSync } from '../base'
import { DataPeopleScore, DataPeopleScoreList } from './data'

const ShowDefaultValues = true
const rejectInvalidInput = true

const dropdownOptions = Array.from({ length: 21 }, (_, i) => ({
  label: '' + i * 5,
  value: i * 5,
}))

const peopleScoreSheetSync = workbookSync.addSheet<DataPeopleScore>({
  id: 'main',
  name: 'People Score',
  freeze: {
    xSplit: 1,
    ySplit: 1,
    startRow: 1,
    startColumn: 0,
  },
})

peopleScoreSheetSync.setDataModel({
  showHeader: true,
  rejectInvalidInput,
  columns: [
    {
      displayName: 'First Name',
      width: 130,
      extractCellData: (rowData) => {
        return {
          value: rowData['firstName'],
          isProtected: true,
        }
      },
    },
    {
      displayName: 'Last Name',
      width: 100,
      innerHidden: true,
      extractCellData: (rowData) => {
        return {
          value: rowData['secondName'],
          isProtected: true,
        }
      },
    },
    {
      displayName: 'Score',
      width: 100,
      extractCellData: (row) => {
        return {
          value: row['score'],
          defaultValue: ShowDefaultValues ? 0 : undefined,
          dropdownOptions:
            !row['score'] || (row['score'] >= 0 && row['score'] <= 100)
              ? dropdownOptions
              : undefined,
        }
      },
      validateCellValue: (value, { row }) => {
        console.log('validateCellValue', value)
        // you should localize messages on your own
        if (value === undefined || value === null) return false
        if (typeof value !== 'number') return 'Must be a number'
        if (value < 0 || value > 100) {
          return 'Must be between 0 and 100'
        }
        return false
      },
      onCellValueChange: (value, { row }) => {
        // preserve the new value in the row data but only if you are not using `accumulateChanges` option
        // you can do async operations here, like saving to a server
        console.log('onCellValueChange', value)
        row['score'] = value as number
      },
    },
  ],
  onActiveListener() {
    // async logic here whenever the sheet becomes active
    // return a disposable to clean up if needed

    peopleScoreSheetSync.setDataModel({
      data: DataPeopleScoreList,
    })
  },
})
