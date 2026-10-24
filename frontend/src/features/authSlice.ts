import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role } from "../lib/types";


export interface User {
    id: string;
    email: string;
    role: Role;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    role: Role | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ id: string; email: string; role: Role; accessToken: string }>
        ) => {
            state.user = {
                id: action.payload.id,
                email: action.payload.email,
                role: action.payload.role,
            };
            state.token = action.payload.accessToken;
            state.role = action.payload.role;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
        }
    }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;