import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  submissions: [],   // All PAN submissions (for Admin/Subadmin)
  userSubmission: null, // Single user's PAN submission (for User)
  error: null,
};

const panSlice = createSlice({
  name: "pan",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSubmissions: (state, action) => {
      state.submissions = action.payload || [];
      state.loading = false;
      state.error = null;
    },
    setUserSubmission: (state, action) => {
      state.userSubmission = action.payload || null;
      state.loading = false;
      state.error = null;
    },
    updateSubmissionStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.submissions.findIndex(sub => sub._id === id);
      if (index !== -1) {
        state.submissions[index].status = status;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearPanState: (state) => {
      state.loading = false;
      state.submissions = [];
      state.userSubmission = null;
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setSubmissions, 
  setUserSubmission, 
  updateSubmissionStatus, 
  setError, 
  clearPanState 
} = panSlice.actions;

export default panSlice.reducer;
