import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  username: string
  token: string
  isLoggedIn: boolean
}

const initialState: UserState = {
  username: '',
  token: '',
  isLoggedIn: false
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; token: string }>) => {
      state.username = action.payload.username
      state.token = action.payload.token
      state.isLoggedIn = true
    },
    logout: (state) => {
      state.username = ''
      state.token = ''
      state.isLoggedIn = false
    }
  }
})

export const { login, logout } = userSlice.actions
export default userSlice.reducer
