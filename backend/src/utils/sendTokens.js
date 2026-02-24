/**
 * Send JWT tokens in HTTP-only cookies + response body
 */

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', // 'lax' works better with proxies in development
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh
};

export const sendTokens = (res, accessToken, refreshToken, user) => {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 min for access
  });
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
    },
    accessToken,
    expiresIn: 900, // 15 min in seconds
  });
};

export const clearTokens = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
