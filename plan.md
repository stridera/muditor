Complete the frontend cleanup to transition from godLevel to role-based authentication system.

High Priority Tasks:

1. **Frontend godLevel Cleanup**:
   - Remove all remaining godLevel references from user-facing pages
   - Search for any lingering `godLevel` or `god_level` references in the frontend
   - Update authentication checks to use the new role system (isBuilder, isCoder, isGod)

2. **Role-Based UI Updates**:
   - Update entity management pages (mobs, objects, shops, zones) to use new role system
   - Ensure all admin features check proper roles instead of godLevel
   - Update permission guards throughout the frontend components

3. **User Authentication Workflow Verification**:
   - Test complete login/logout workflow with different roles
   - Verify role hierarchy enforcement (PLAYER → IMMORTAL → BUILDER → CODER → GOD)
   - Ensure protected routes work correctly for all user types

4. **Entity Editor Permission Integration**:
   - Update mob/object/shop editors with role-based editing permissions
   - Integrate role checks into the Visual Zone Editor for editing capabilities
   - Add proper permission messaging for users without edit access

Focus on removing godLevel references and ensuring the role-based system works throughout the UI. Test with different user roles to ensure proper access control.
