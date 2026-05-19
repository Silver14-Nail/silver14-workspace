import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from './storage';
import cartReducer from './slices/cart.slice';
import wishlistReducer from './slices/wishlist.slice';
import currencyReducer from './slices/currency.slice';
import authReducer from './slices/auth.slice';

const rootReducer = combineReducers({
  cart: cartReducer,
  wishlist: wishlistReducer,
  currency: currencyReducer,
  auth: authReducer,
});

const persistConfig = {
  key: 'lunelle',
  storage,
  // auth is NOT persisted — tokens live in their own localStorage key (silver14-customer-auth)
  whitelist: ['cart', 'wishlist', 'currency'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
