
// ========================================
// FILE: lib/auth.js
// Authentication utilities
// ========================================

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to verify JWT token from request
 */
export async function verifyAuth(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return { authenticated: false, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true
      }
    });

    if (!user) {
      return { authenticated: false, error: 'User not found' };
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    };

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return { authenticated: false, error: 'Invalid or expired token' };
    }
    return { authenticated: false, error: 'Authentication failed' };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Middleware wrapper to protect API routes
 */
export function withAuth(handler, options = {}) {
  return async (request) => {
    const auth = await verifyAuth(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check role if specified
    if (options.role && auth.user.role !== options.role) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Attach user to request
    request.user = auth.user;

    return handler(request);
  };
}

/**
 * Generate password reset token
 */
export function generateResetToken() {
  return jwt.sign(
    { purpose: 'reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}