import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

// Ensure we have a valid JWT secret
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your-jwt-secret-here') {
    console.error('JWT_SECRET is not properly configured. Using fallback secret. This should be fixed in production.');
    return new TextEncoder().encode('dev-secret-change-this-in-production');
  }
  return new TextEncoder().encode(secret);
};

export interface JWTPayload {
  userId: string;
  role: string;
  [key: string]: string;
}

export const generateToken = async (payload: JWTPayload): Promise<string> => {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(getJwtSecret());
    
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  if (!token || token === 'undefined' || token === '[object Object]' || token === 'null') {
    console.log('Invalid token format');
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    
    if (!payload.userId || !payload.role) {
      console.error('Token missing required fields');
      return null;
    }

    return {
      userId: payload.userId as string,
      role: payload.role as string
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

// Add this to your existing utils.ts file or update if it exists

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get token from cookies
  const cookies = request.cookies;
  const tokenFromCookie = cookies.get('auth-token')?.value || cookies.get('token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }
  
  // Try to get token from query parameter (not recommended for production)
  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get('token');
  if (tokenFromQuery) {
    return tokenFromQuery;
  }
  
  return null;
}

export const isAuthenticated = async (request: NextRequest) => {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch (error) {
    console.error('Authentication check failed:', error);
    return null;
  }
};

export const requireAuth = async (request: NextRequest) => {
  const auth = await isAuthenticated(request);
  if (!auth) {
    throw new Error('Authentication required');
  }
  return auth;
};

export const requireRole = async (request: NextRequest, roles: string[]) => {
  const auth = await requireAuth(request);
  if (!roles.includes(auth.role)) {
    throw new Error('Insufficient permissions');
  }
  return auth;
};
