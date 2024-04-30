import { createSlice } from "@reduxjs/toolkit";

// const userInstance = {
//   "_id": "alkjflksajfdlklkasjdklfjJ#$LKjlk",
//   "userName": "sumit",
//   "fullName": "sumit saraswat",
//   "email": "sumitsaraswat04@gmail.com",
//   "avatar": "cloudinary-url-of-avatar",
// }

const userSlice = createSlice({
  name: "user",
  initialState: {
    authUser: null,
    otherUsers: null,
    selectedUser: null,
    onlineUsers: null,
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});
export const { setAuthUser , setOtherUsers, setSelectedUser, setOnlineUsers } = userSlice.actions;
export default userSlice.reducer;
