import { Response } from 'express';
import { RequestWithUser } from '@/types';
import { usersDb } from '@/database';
import { success, error } from '@/utils/apiResponse';

// VULNERABILITY (Prototype Pollution):
// Insecure recursive deep merge without sanitizing dangerous properties like __proto__ or constructor.
function unsafeMerge(target: any, source: any): any {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) {
        target[key] = {};
      }
      unsafeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export function profileSettingsController(req: RequestWithUser, res: Response): void {
  const userId = req.user?.userId;
  if (!userId) {
    error(res, 'Authentication required', 401);
    return;
  }

  const user = usersDb.findById(userId);
  if (!user) {
    error(res, 'User profile not found', 404);
    return;
  }

  const userPreferences = (user as any).preferences || {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      sms: false,
    },
  };

  try {
    // Unsafely deep-merge input into user preferences
    unsafeMerge(userPreferences, req.body);

    usersDb.update(user.id, {
      ...user,
      preferences: userPreferences,
    } as any);

    success(res, {
      userId: user.id,
      preferences: userPreferences,
      // Reflect the effective isAdmin status of the current user object
      effectivePrivileges: {
        isAdmin: Boolean((user as any).isAdmin),
        roles: (user as any).roles,
      },
    }, 'User preferences updated successfully');
  } catch (err: any) {
    error(res, `Failed to update preferences: ${err.message}`, 500);
  }
}
