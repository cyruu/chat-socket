import { createSlice } from "@reduxjs/toolkit";

interface iSocketState {
  socket: WebSocket | null;
  isSocketConnected: boolean;
  temp: Object | null;
}

const socketSlice = createSlice({
  name: "socket-slice",
  initialState: {
    socket: null,
    isSocketConnected: false,
    temp: null,
  } as iSocketState,
  reducers: {
    settemp: (state, action) => {
      state.temp = action.payload;
    },
  },
});

export const { settemp } = socketSlice.actions;

export default socketSlice.reducer;
