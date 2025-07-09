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
    setUser: (state, action) => {
        console.log("Setting User in Redux:", action.payload);
        state.user = action.payload || null;
        state.admin = null;
        state.subAdmin = null;
        state.error = null;
      },
      
    setAdmin: (state, action) => {
      console.log("Setting Admin in Redux:", action.payload);
      state.admin = action.payload || null;
      state.user = null;
      state.error = null;
    },    
    setSubAdmin: (state, action) => {
      console.log("Setting SubAdmin in Redux:", action.payload);
      state.subAdmin = action.payload || null;
      state.user = null;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
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

export const { setLoading, setUser, setError, setLogout, setAdmin, setSubAdmin } = authSlice.actions;
export default authSlice.reducer;
