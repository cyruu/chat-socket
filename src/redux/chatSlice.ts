import { createSlice } from "@reduxjs/toolkit";

interface iChatState {
  allConnectedUsers: string[] | null;
}

const chatSlice = createSlice({
  name: "chat-slice",
  initialState: {
    allConnectedUsers: [],
  } as iChatState,
  reducers: {
    setAllConnectedUsers: (state, action) => {
      state.allConnectedUsers = action.payload;
    },
  },
});

export const { setAllConnectedUsers } = chatSlice.actions;

export default chatSlice.reducer;
