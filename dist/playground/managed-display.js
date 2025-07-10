import { faker } from '@faker-js/faker';
import { workbookSync } from './base';
faker.seed(123);
const fakerOptions = [
    {
        label: 'Book title',
        value: 'book.title',
        call: () => faker.book.title(),
    },
    {
        label: 'Author',
        value: 'book.author',
        call: () => faker.book.author(),
    },
    {
        label: 'Full name',
        value: 'person.fullName',
        call: () => faker.person.fullName(),
    },
    {
        label: 'Genre',
        value: 'book.genre',
        call: () => faker.book.genre(),
    },
    {
        label: 'Series',
        value: 'book.series',
        call: () => faker.book.series(),
    },
    {
        label: 'Publisher',
        value: 'book.publisher',
        call: () => faker.book.publisher(),
    },
    {
        label: 'Format',
        value: 'book.format',
        call: () => faker.book.format(),
    },
    {
        label: 'ISBN',
        value: 'commerce.isbn',
        call: () => faker.commerce.isbn(),
    },
    {
        label: 'Price',
        value: 'commerce.price',
        call: () => faker.commerce.price(),
    },
];
const managedData = Array.from({ length: 15 }, (_, index) => ({
    index,
}));
const extractCellData = function (rowData, _column) {
    var _a;
    const column = _column;
    const value = (rowData[_a = column.key] ?? (rowData[_a] = fakerOptions.find((item) => item.value === column.faker)?.call() ??
        'Unknown'));
    return {
        value,
    };
};
const onDataCellValueChange = function (value, cell) {
    // @ts-ignore
    cell.row[cell.column.key] = value;
};
const managedColumnsData = [
    {
        key: 'author',
        displayName: 'Author',
        width: 200,
        faker: 'book.author',
        defaultOrder: 1,
    },
    {
        key: 'title',
        displayName: 'Title',
        width: 300,
        faker: 'book.title',
        defaultOrder: 2,
    },
    {
        key: 'price',
        displayName: 'Price',
        width: 100,
        faker: 'commerce.price',
        defaultOrder: 3,
    },
];
const getManagedColumns = () => {
    const columns = managedColumnsData.map((_column) => {
        const column = _column;
        column.extractCellData = extractCellData;
        column.onCellValueChange = onDataCellValueChange;
        return column;
    });
    return [...columns].sort((a, b) => (a.order ?? a.defaultOrder ?? 0) - (b.order ?? b.defaultOrder ?? 0));
};
const dataSheetSync = workbookSync.addSheet({
    id: 'managedTable',
    name: 'Data for Managed Demo',
    freeze: {
        xSplit: 1,
        ySplit: 1,
        startRow: 1,
        startColumn: 0,
    },
});
dataSheetSync.setDataModel({
    showHeader: true,
    rejectInvalidInput: true,
    columns: getManagedColumns(),
    freeRows: 5,
    onNewRow(row) {
        let isAllFilled = true;
        for (const column of managedColumnsData) {
            if (!row[column.key])
                isAllFilled = false;
        }
        if (!isAllFilled)
            return false;
        managedData.push(row);
        return row;
    },
    data: managedData,
    onActiveListener: () => {
        dataSheetSync.setDataModel({
            freeRows: 5,
            columns: getManagedColumns(),
            data: managedData,
        });
    },
});
const onCellValueChange = function (value, cell) {
    // @ts-ignore
    cell.row[cell.column.key] = value;
};
const schemaSheetSync = workbookSync.addSheet({
    id: 'managedSchema',
    name: 'Schema for Managed Demo',
    freeze: {
        xSplit: 1,
        ySplit: 1,
        startRow: 1,
        startColumn: 0,
    },
});
schemaSheetSync.setDataModel({
    showHeader: true,
    rejectInvalidInput: true,
    data: managedColumnsData,
    freeRows: 1,
    onNewRow(row) {
        if (!row.faker || !row.key)
            return false;
        row.width ?? (row.width = 200);
        row.displayName ?? (row.displayName = row.key);
        row.defaultOrder = managedColumnsData.length + 1;
        managedColumnsData.push(row);
        return row;
    },
    columns: [
        {
            key: 'key',
            displayName: 'Key',
            width: 80,
            extractCellData: (rowData) => ({
                value: rowData.key,
            }),
            validateCellValue: (value) => {
                if (!value || typeof value !== 'string') {
                    return 'Key must be a non-empty string';
                }
            },
            onCellValueChange,
        },
        {
            key: 'displayName',
            displayName: 'Display Name',
            width: 200,
            extractCellData: (rowData) => ({
                value: rowData.displayName,
            }),
            onCellValueChange,
        },
        {
            key: 'faker',
            displayName: 'Faker data',
            width: 200,
            extractCellData: (rowData) => ({
                value: rowData.faker,
                dropdownOptions: fakerOptions,
            }),
            extractNewCellData: (rowData) => ({
                value: rowData.faker,
                dropdownOptions: fakerOptions,
            }),
            validateCellValue: (value, cell) => {
                if ((!value && !cell.isNewRow) ||
                    (value && !fakerOptions.some((item) => item.value === value))) {
                    return 'Invalid faker value';
                }
            },
            onCellValueChange,
        },
        {
            key: 'width',
            displayName: 'Width',
            width: 100,
            extractCellData: (rowData) => ({
                value: rowData.width,
            }),
            validateCellValue: (value) => {
                const num = Number(value);
                if (isNaN(num) || num < 0 || num > 1000) {
                    return 'Width must be a positive number between 0 and 1000';
                }
            },
            onCellValueChange,
        },
        {
            key: 'order',
            displayName: 'Order',
            width: 100,
            extractCellData: (rowData) => ({
                value: rowData.order,
                defaultValue: rowData.defaultOrder,
            }),
            validateCellValue: (value) => {
                const num = Number(value);
                if (isNaN(num)) {
                    return 'Order must be a number';
                }
            },
            onCellValueChange,
        },
    ],
});
//# sourceMappingURL=managed-display.js.map