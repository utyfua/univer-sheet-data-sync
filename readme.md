# univer-sheet-data-sync

Easier way to sync data between Univer Sheets and custom data sources.

To use please review the [playground example](https://github.com/utyfua/univer-sheet-data-sync/blob/master/playground/main.ts).
Live preview is available [here](https://utyfua.github.io/univer-sheet-data-sync/).

## Notes

- You need to add at least one sheet via the `upsertSheet` method before calling `.bootstrap()`;
  otherwise, Univer will create an empty sheet.
- You can override any part of the data model via the `setSheetDataModel` method, including data and listeners.
  - When replacing a listener, the library will gradually dispose of the old one and start using the new one.
- You can skip setting `data` unless you actually have data to show. 
  - For example, you can use `setSheetDataModel` to fetch data from the server and then set it to the sheet.

## Keep data model in sync

### `rejectInvalidInput` is true

When `rejectInvalidInput` is true, the library will use `validateCellValue` to check if the value is valid before 
calling `onCellValueChange`.

### `accumulateChanges` is false

When `accumulateChanges` is false or not set, the library will expect you are modifying 
or persisting the data object yourself when handling `onCellValueChange`.
If you are not doing this, the library will keep new state until you set same data again via `setDataModel`.

### `accumulateChanges` is true

When `accumulateChanges` is true, the library will accumulate changes as set of mutations.
`validateCellValue` and `onCellValueChange` will be called for each change but you SHOULD NOT change the data.

## License

`univer-sheet-data-sync` is released under the MIT License.

---

`univer-sheet-data-sync` is not affiliated with Univer or DreamNum Co., Ltd.
