import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import panSlice from "./panSlice";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 
import { combineReducers } from "redux";



const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['loading', 'error'], 
};


const panPersistConfig = {
  key: 'pan',
  storage,
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authSlice),
  pan: persistReducer(panPersistConfig, panSlice),
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store); 

export { store };
export default store;
