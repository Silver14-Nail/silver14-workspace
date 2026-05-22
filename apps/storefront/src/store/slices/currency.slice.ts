import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CURRENCY_META,
  DEFAULT_CURRENCY_CODE,
  type CurrencyCode,
} from '@/config/commerce.config';
import type { ExchangeRates } from '@/services/currency.service';

export interface CurrencyState {
  code: CurrencyCode;
  exchangeRates: ExchangeRates;
}

const DEFAULT_RATES: ExchangeRates = { USD_EUR: 1, EUR_USD: 1 };

const initialState: CurrencyState = {
  code: DEFAULT_CURRENCY_CODE,
  exchangeRates: DEFAULT_RATES,
};

export const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<CurrencyCode>) {
      if (CURRENCY_META[action.payload]) {
        state.code = action.payload;
      }
    },
    setExchangeRates(state, action: PayloadAction<ExchangeRates>) {
      state.exchangeRates = action.payload;
    },
  },
});

export const currencyActions = currencySlice.actions;
export default currencySlice.reducer;
