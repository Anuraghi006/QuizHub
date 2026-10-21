import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunks talk to the server. Their results are handled in extraReducers below.
export const registerUser = createAsyncThunk('auth/register', async (formData, thunkAPI) => {
    try {
        const response = await axios.post('/api/register', formData)
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
})

export const loginUser = createAsyncThunk('auth/login', async (formData, thunkAPI) => {
    try {
        const response = await axios.post('/api/login', formData)
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed')
    }
})

// Saves the token and user in the state and in localStorage (so a refresh keeps you logged in)
function saveSession(state, data) {
    state.token = data.token
    state.user = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
}

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user')),
        error: '',
    },
    reducers: {
        logout: (state) => {
            state.token = null
            state.user = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => { state.error = '' })
            .addCase(loginUser.fulfilled, (state, action) => { saveSession(state, action.payload) })
            .addCase(loginUser.rejected, (state, action) => { state.error = action.payload })
            .addCase(registerUser.pending, (state) => { state.error = '' })
            .addCase(registerUser.fulfilled, (state, action) => { saveSession(state, action.payload) })
            .addCase(registerUser.rejected, (state, action) => { state.error = action.payload })
    }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
