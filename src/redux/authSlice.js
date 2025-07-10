import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: false,
    user: null,
    admin: null,
    subAdmin: null,
    error: null,
  };
  

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetLoading: (state) => {
      state.loading = false;
    },
    setUser: (state, action) => {
        console.log("Setting User in Redux:", action.payload);
        state.user = action.payload || null;
        state.admin = null;
        state.subAdmin = null;
        state.error = null;
        state.loading = false; 
      },
      
    setAdmin: (state, action) => {
      console.log("Setting Admin in Redux:", action.payload);
      state.admin = action.payload || null;
      state.user = null;
      state.error = null;
      state.loading = false; 
    },    
    setSubAdmin: (state, action) => {
      console.log("Setting SubAdmin in Redux:", action.payload);
      state.subAdmin = action.payload || null;
      state.user = null;
      state.error = null;
      state.loading = false; 
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false; 
    },
    setLogout: (state) => {
      console.log("Logging out...");
      state.user = null;
      state.admin = null;
      state.subAdmin = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, resetLoading, setUser, setError, setLogout, setAdmin, setSubAdmin } = authSlice.actions;
export default authSlice.reducer;
