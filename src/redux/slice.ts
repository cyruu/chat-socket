import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
console.log("slice file running");

export const getApiCount = createAsyncThunk(
  "counter/getApiCount",
  async (thunkApi) => {
    // const { data: resData } = await axios.get("/api/getuser");
    // return resData.count;
    // return 0;
  }
);

const slice = createSlice({
  name: "counter",
  initialState: {
    count: window.localStorage.getItem("count") || 77,
    loggedInUser: null,
    loggedIn: false,
    countLoading: true,
  },
  reducers: {
    increase: (state) => {
      const temp = state.count + 1;
      window.localStorage.setItem("count", String(temp));
      return { ...state, count: temp };
    },
    display: (state) => {
      console.log("state is: ", JSON.stringify(state));
    },
    setCount: (state, { payload }) => {
      return { ...state, count: payload.gotCount };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getApiCount.pending, (state) => {
      console.log("getApiCount pending");
    });
    builder.addCase(getApiCount.fulfilled, (state, { payload }) => {
      // localStorage.setItem("count", String(payload));

      return { ...state, count: payload, countLoading: false };
    });
  },
});

export const { increase, display, setCount } = slice.actions;
export default slice.reducer;
