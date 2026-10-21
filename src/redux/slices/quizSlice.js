import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Asks the server to build a quiz. The questions come back without the correct answers.
export const startQuiz = createAsyncThunk('quiz/start', async (settings, thunkAPI) => {
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        const response = await axios.post('/api/quiz/start', settings, { headers })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not start the quiz')
    }
})

// Sends the answers. The server scores them and returns the id of the saved result.
export const submitQuiz = createAsyncThunk('quiz/submit', async (_, thunkAPI) => {
    const { quizId, answers } = thunkAPI.getState().quizReducer
    try {
        const headers = { Authorization: `Bearer ${thunkAPI.getState().authReducer.token}` }
        const response = await axios.post('/api/quiz/submit', { quizId, answers }, { headers })
        return response.data
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not submit the quiz')
    }
})

const initialState = {
    status: 'idle',       // idle | active | submitting | finished
    quizId: null,
    timeLimit: 0,
    timeLeft: 0,
    questions: [],
    currentIndex: 0,
    answers: {},          // { [questionId]: optionIndex }
    resultId: null,
    error: '',
}

const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        selectAnswer: (state, action) => {
            state.answers[action.payload.questionId] = action.payload.optionIndex
        },
        goToQuestion: (state, action) => {
            state.currentIndex = action.payload
        },
        tick: (state) => {
            if (state.timeLeft > 0) state.timeLeft -= 1
        },
        resetQuiz: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(startQuiz.pending, (state) => { state.error = '' })
            .addCase(startQuiz.fulfilled, (state, action) => {
                state.status = 'active'
                state.quizId = action.payload.quizId
                state.timeLimit = action.payload.timeLimit
                state.timeLeft = action.payload.timeLimit
                state.questions = action.payload.questions
                state.currentIndex = 0
                state.answers = {}
                state.resultId = null
            })
            .addCase(startQuiz.rejected, (state, action) => { state.error = action.payload })
            .addCase(submitQuiz.pending, (state) => {
                state.status = 'submitting'
                state.error = ''
            })
            .addCase(submitQuiz.fulfilled, (state, action) => {
                state.status = 'finished'
                state.resultId = action.payload.id
            })
            .addCase(submitQuiz.rejected, (state, action) => {
                state.status = 'active'
                state.error = action.payload
            })
    }
})

export const { selectAnswer, goToQuestion, tick, resetQuiz } = quizSlice.actions
export default quizSlice.reducer
