import {
  SET_ACCOUNTS_DATA,
  SET_CURRENT_ACCOUNT_INDEX,
  SET_INITIAL_ACCOUNT_DATA,
  SET_CURRENT_ACCOUNT_METADATA_STATUS,
} from '../types';

const initialState = {
  accounts: [],
  currentAccountIndex: -1,
  metadata_status: -1,
};

const AccountsReducer = (state = initialState, action) => {
  console.log('action');
  switch (action.type) {
    case SET_INITIAL_ACCOUNT_DATA: {
      console.log('Account Action: ', SET_INITIAL_ACCOUNT_DATA);
      return {
        ...state,
        accounts: [action.payload],
        currentAccountIndex: 0,
      };
    }
    case SET_ACCOUNTS_DATA: {
      console.log('Account Action: ', SET_ACCOUNTS_DATA);
      return {
        ...state,
        accounts: [].concat(action.payload?.accounts || state.accounts),
        currentAccountIndex:
          action.payload?.currentAccountIndex || state.currentAccountIndex,
      };
    }
    case SET_CURRENT_ACCOUNT_INDEX: {
      return {
        ...state,
        currentAccountIndex: parseInt(action.payload),
      };
    }
    case SET_CURRENT_ACCOUNT_METADATA_STATUS: {
      console.log('Account Action: ', SET_CURRENT_ACCOUNT_METADATA_STATUS);
      let old_state = state;
      if (old_state.accounts && old_state.accounts[state.currentAccountIndex]) {
        old_state.accounts[state.currentAccountIndex].metadata_status =
          action.payload;
      } else {
        // return state;
        console.log('not found data from redux store');
      }
      return state;
    }
    default: {
      return state;
    }
  }
};

export default AccountsReducer;

// case 'test': {
//   console.log('HERE TEst ACtiON;');
//   return state;
// }
