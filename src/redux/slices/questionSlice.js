import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Every request sends the login token, which the server checks.
export const fetchCategories = createAsyncThunk('questions/fetchCategories', async (_, thunkAPI) => {
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        const response = await axios.get('/api/categories', { headers })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not load categories')
    }
})

export const fetchQuestions = createAsyncThunk('questions/fetchAll', async (_, thunkAPI) => {
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        const response = await axios.get('/api/admin/questions', { headers })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not load questions')
    }
})

export const addQuestion = createAsyncThunk('questions/add', async (formData, thunkAPI) => {
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        const response = await axios.post('/api/admin/questions', formData, { headers })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not add question')
    }
})

export const updateQuestion = createAsyncThunk('questions/update', async ({ id, formData }, thunkAPI) => {
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        const response = await axios.put(`/api/admin/questions/${id}`, formData, { headers })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not update question')
    }
})

export const deleteQuestion = createAsyncThunk('questions/delete', async (id, thunkAPI) => {
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        await axios.delete(`/api/admin/questions/${id}`, { headers })
        return id
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not delete question')
    }
})

const questionSlice = createSlice({
    name: 'questions',
    initialState: {
        categories: [],
        questions: [],
        error: '',
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.error = action.payload
            })
            .addCase(fetchQuestions.fulfilled, (state, action) => {
                state.questions = action.payload
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.error = action.payload
            })
            .addCase(addQuestion.fulfilled, (state, action) => {
                state.questions.unshift(action.payload)
            })
            .addCase(updateQuestion.fulfilled, (state, action) => {
                const index = state.questions.findIndex((q) => q.id === action.payload.id)
                if (index !== -1) state.questions[index] = action.payload
            })
            .addCase(deleteQuestion.fulfilled, (state, action) => {
                state.questions = state.questions.filter((q) => q.id !== action.payload)
            })
    }
})

export default questionSlice.reducer
