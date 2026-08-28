import { Platform } from 'react-native';

export const fonts = {
  openSans: {
    regular: Platform.select({ ios: 'OpenSans', default: 'OpenSans-Regular' }),
    regularItalic: 'OpenSans-Italic',
    semiBold: 'OpenSans-Semibold',
    semiBoldItalic: 'OpenSans-SemiboldItalic',
    bold: 'OpenSans-Bold',
    boldItalic: 'OpenSans-BoldItalic',
  },
};
