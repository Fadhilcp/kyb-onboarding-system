import { Response, CookieOptions } from 'express';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const getCookieOptions = (): CookieOptions => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const setRefreshTokenCookie = (res: Response, token: string): void => {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, getCookieOptions());
};

export const clearRefreshTokenCookie = (res: Response): void => {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getCookieOptions());
};