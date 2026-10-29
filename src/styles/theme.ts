import type { ThemeConfig } from 'antd'

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#C9961B',
    colorInfo: '#4778D5',
    colorSuccess: '#16A36A',
    colorWarning: '#E5A126',
    colorError: '#DC4C4C',
    colorText: '#171A23',
    colorTextSecondary: '#737987',
    colorBorder: '#E7E9EE',
    colorBgLayout: '#F6F7F9',
    colorBgContainer: '#FFFFFF',
    borderRadius: 10,
    fontFamily: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    controlHeight: 40,
    boxShadowSecondary: '0 12px 32px rgba(23, 26, 35, 0.08)',
  },
  components: {
    Button: {
      primaryColor: '#171A23',
      fontWeight: 600,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Table: {
      headerBg: '#F8F7F4',
      headerColor: '#171A23',
      rowHoverBg: '#FBF8F1',
      borderColor: '#E7E9EE',
      cellPaddingBlock: 14,
    },
  },
}
