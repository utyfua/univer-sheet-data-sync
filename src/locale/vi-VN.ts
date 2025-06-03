import type enUS from './en-US'

const locale: typeof enUS = {
  communityUniverDataSync: {
    protectedAlert: {
      title: 'Ô này đã được bảo vệ',
      message: 'Bạn không thể chỉnh sửa ô này',
    },
    formulaRejectAlert: {
      title: 'Công thức không được phép',
      message: 'Công thức không được phép trong ô này',
    },
  },
  // https://github.com/dream-num/univer/blob/6498d15464c9b4eb832eef261275d8028b05397a/packages/sheets-data-validation-ui/src/locale/en-US.ts
  dataValidation: {
    panel: {
      invalid: 'Không hợp lệ',
    },
    any: {
      error: 'Nội dung của ô này vi phạm quy tắc xác thực',
    },
    list: {
      dropdown: 'Chọn',
    },
  },
}

export default locale
