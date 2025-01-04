import { configureStore } from "@reduxjs/toolkit";
import socketReducer from "@/redux/socketSlice";

export const myStore = configureStore({
  reducer: socketReducer,
});
