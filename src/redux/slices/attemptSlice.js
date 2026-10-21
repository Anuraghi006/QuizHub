import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchHistory = createAsyncThunk('attempts/history', async (_, thunkAPI) => {
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        const response = await axios.get('/api/attempts/mine', { headers })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not load history')
    }
})

export const fetchLeaderboard = createAsyncThunk('attempts/leaderboard', async (_, thunkAPI) => {
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        const response = await axios.get('/api/leaderboard', { headers })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not load leaderboard')
    }
})

export const fetchResult = createAsyncThunk('attempts/result', async (id, thunkAPI) => {
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        const response = await axios.get(`/api/attempts/${id}`, { headers })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Result not found')
    }
})

const attemptSlice = createSlice({
    name: 'attempts',
    initialState: {
        history: [],
        leaderboard: [],
        result: null,
        error: '',
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHistory.fulfilled, (state, action) => { state.history = action.payload })
            .addCase(fetchHistory.rejected, (state, action) => { state.error = action.payload })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => { state.leaderboard = action.payload })
            .addCase(fetchLeaderboard.rejected, (state, action) => { state.error = action.payload })
            .addCase(fetchResult.pending, (state) => { state.result = null; state.error = '' })
            .addCase(fetchResult.fulfilled, (state, action) => { state.result = action.payload })
            .addCase(fetchResult.rejected, (state, action) => { state.error = action.payload })
    }
})

export default attemptSlice.reducer
