import { configureStore } from "@reduxjs/toolkit";
import socketReducer from "@/redux/socketSlice";
import chatReducer from "@/redux/chatSlice";

export const myStore = configureStore({
  reducer: {
    socketReducer: socketReducer,
    chatReducer: chatReducer,
  },
});
