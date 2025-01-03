import { configureStore } from "@reduxjs/toolkit";
import reducer from "@/redux/slice";

export const store = configureStore({
  reducer: reducer,
});
