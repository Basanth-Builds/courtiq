# CourtIQ Access Codes

This document contains the access codes required for specific roles in the CourtIQ tournament management system.

## Role-Based Access Control

When users sign up for CourtIQ, they are presented with a role selection screen. Some roles require access codes to prevent unauthorized access to administrative functions.

### Available Roles

#### 🏓 **Player** (No Access Code Required)
- Can participate in tournaments
- View their match history and statistics
- Access player dashboard

#### 👥 **Spectator** (No Access Code Required)  
- Watch live matches
- Explore tournaments
- View tournament brackets and results

#### 🏆 **Tournament Organizer** (Access Code Required)
- **Access Code: `9770`**
- Create and manage tournaments
- Add players to tournaments
- Create match fixtures
- Assign referees to matches
- View tournament statistics

#### ⚖️ **Referee** (Access Code Required)
- **Access Code: `7020`**
- Score matches with live updates
- Start and end matches
- Manage assigned matches
- Access live scoring interface

## How Access Codes Work

### Initial Registration
1. **User Registration**: Users sign up using email magic link, phone OTP, or Google OAuth
2. **Role Selection**: After authentication, users are redirected to role selection
3. **Access Code Prompt**: When selecting Organizer or Referee roles, users must enter the correct access code
4. **Verification**: Access codes are verified server-side for security
5. **Immediate Role Assignment**: Upon successful verification, the role is assigned immediately
6. **Automatic Redirect**: Users are automatically redirected to their role-specific dashboard

### Changing Roles (Settings)
1. **Settings Access**: Users can access settings from any dashboard via the user menu
2. **Role Change**: Users can select a different role in the settings page
3. **Access Code Verification**: Protected roles (Organizer/Referee) require access code verification
4. **Immediate Role Change**: Upon successful access code verification, the role changes immediately
5. **Automatic Redirect**: Users are automatically redirected to the new role's dashboard

## Security Features

- **Server-Side Verification**: Access codes are stored as environment variables and verified on the server
- **No Client-Side Exposure**: Codes are never exposed in the frontend code
- **Role-Based Permissions**: Database policies ensure users can only access features appropriate to their role
- **Secure Storage**: Codes are stored in `.env.local` and not committed to version control

## Changing Access Codes

To change access codes:

1. Update the environment variables in `.env.local`:
   ```env
   ORGANIZER_ACCESS_CODE=your_new_organizer_code
   REFEREE_ACCESS_CODE=your_new_referee_code
   ```

2. Restart the development server:
   ```bash
   npm run dev
   ```

3. For production, update the environment variables in your hosting platform

## Distribution Guidelines

- **Tournament Organizers**: Share the organizer access code only with trusted individuals who will manage tournaments
- **Referees**: Provide the referee access code to certified referees who will officiate matches
- **Security**: Treat access codes as sensitive information and change them periodically
- **Documentation**: Keep this document updated when codes are changed

## Settings Page Features

The settings page (`/settings`) allows users to:

- **Update Profile Information**: Change name and view email
- **Switch Roles**: Change to any available role with proper verification
- **Access Code Protection**: Protected roles require access code verification
- **Immediate Role Change**: Protected roles (Organizer/Referee) change immediately after access code verification
- **Automatic Redirect**: Users are automatically redirected to the new dashboard after role change

### Accessing Settings
- Click on the user menu (profile icon) in any dashboard
- Select "Settings" from the dropdown menu
- Or navigate directly to `/settings`

## Troubleshooting

### "Invalid access code" Error
- Verify the code is exactly 4 digits
- Ensure no extra spaces or characters
- Check that the correct code is being used for the selected role
- Contact the administrator if the code has been changed

### Role Selection Issues
- Clear browser cache and cookies
- Try signing out and signing back in
- Check the browser console for any JavaScript errors
- Use the debug page at `/debug` to troubleshoot authentication issues

### Settings Page Issues
- Ensure you're logged in and have a valid session
- Try refreshing the page if settings don't load
- Check that your profile exists in the database
- Contact support if role changes don't take effect

## Contact

For access code requests or issues, contact the system administrator.