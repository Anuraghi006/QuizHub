import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice'
import quizReducer from './slices/quizSlice'
import questionReducer from './slices/questionSlice'
import attemptReducer from './slices/attemptSlice'

const store = configureStore({
    reducer: {
        authReducer: authReducer,
        quizReducer: quizReducer,
        questionReducer: questionReducer,
        attemptReducer: attemptReducer,
    }
})

export default store
