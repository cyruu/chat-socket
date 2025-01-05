import { createSlice } from "@reduxjs/toolkit";

interface iSocketState {
  socket: WebSocket | null;
}

const socketSlice = createSlice({
  name: "socket-slice",
  initialState: {
    socket: null,
  } as iSocketState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
  },
});

export const { setSocket } = socketSlice.actions;

export default socketSlice.reducer;
