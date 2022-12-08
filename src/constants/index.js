import {colors} from '../styles';

const avatar1Image = require('../assets/avatars/avatar1.png');
const avatar2Image = require('../assets/avatars/avatar2.png');
const avatar3Image = require('../assets/avatars/avatar3.png');
const avatars = [avatar1Image, avatar2Image, avatar3Image];

export default {
  HARDENED_OFFSET: 0x80000000,

  passwordStrengthCheckOption: [
    {
      id: 0,
      value: 'Too weak',
      minDiversity: 0,
      minLength: 0,
    },
    {
      id: 1,
      value: 'Weak',
      minDiversity: 1,
      minLength: 6,
    },
    {
      id: 2,
      value: 'Medium',
      minDiversity: 2,
      minLength: 8,
    },
    {
      id: 3,
      value: 'Strong',
      minDiversity: 4,
      minLength: 10,
    },
  ],
  passwordLevelColor: {
    'Too weak': colors.red5,
    Weak: colors.primary5,
    Medium: colors.blue5,
    Strong: colors.green5,
  },
  saltRound: 10,
  avatars,
  avatarsCount: 3,
  currencyConversionProps: [
    {label: 'United States Dollar', value: 'USD'},
    {label: 'United Kindom Pound', value: 'GBP'},
    {label: 'Canada Dollar', value: 'CAD'},
    {label: 'Cayman Islands Dollar', value: 'KYD'},
    {label: 'Chile Peso', value: 'CLP'},
    {label: 'China Yuan Renminbi', value: 'CNY'},
    {label: 'Denmark Krone', value: 'DKK'},
    {label: 'Egypt Pound', value: 'EGP'},
    {label: 'India Rupee', value: 'INR'},
    {label: 'Japan Yen', value: 'JPY'},
  ],
  autoLockProps: [
    {label: 'Immediately', value: '0'},
    {label: 'After 5 seconds', value: '5'},
    {label: 'After 15 seconds', value: '15'},
    {label: 'After 30 seconds', value: '30'},
    {label: 'After 60 seconds', value: '60'},
    {label: 'After 5 minutes', value: '300'},
    {label: 'After 10 minutes', value: '600'},
    {label: 'Never', value: '-1'},
  ],
  algorithm_type: 'RS256',
  setupContractAddress: '0x893441cBbAe1A57B3F80733BEb24891ad778bcae',
  transactionContractAddress: '0x8036db95C4713CdD5412B007C49c90B2B8c0129F',
  authServer: {
    // client_id: 'GsK66WwDWXtKK5M0UwRKjfXUG5bLtEzy',
    // auth_domain: 'dev-6bifn837yrbbrwa5.uk.auth0.com'
    client_id: 'rafLIaSBMmijwLCcVOOhzr85JPd3TWII',
    auth_domain: 'dev-gzp4fi4e78cxaofe.us.auth0.com'
  },
  host: 'https://api.blockauthy.io/',
  devHost: 'http://localhost:8000/',
  metadata: {
    SAME: 0,
    DIFFERENT: 1,
    NOTSET: 2,
    NOTREAD: 3,
  }
};
