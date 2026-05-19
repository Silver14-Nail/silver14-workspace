import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from '@/config/commerce.config';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  rate: number;
  label: string;
}

export interface CurrencyState {
  current: CurrencyInfo;
}

const initialState: CurrencyState = {
  current: DEFAULT_CURRENCY,
};

export const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<CurrencyCode>) {
      const found = CURRENCIES.find((c) => c.code === action.payload);
      if (found) state.current = found;
    },
  },
});

export const currencyActions = currencySlice.actions;
export default currencySlice.reducer;
