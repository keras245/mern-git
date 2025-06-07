 import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'constants.dart';

class LogoutHelper {
  static void showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          title: Row(
            children: [
              Icon(Icons.logout_rounded, color: AppColors.danger),
              SizedBox(width: AppSizes.sm),
              Text('Déconnexion'),
            ],
          ),
          content: Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(dialogContext).pop();
                await _performLogout(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.danger,
                foregroundColor: AppColors.white,
              ),
              child: Text('Déconnexion'),
            ),
          ],
        );
      },
    );
  }

  static Future<void> _performLogout(BuildContext context) async {
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Center(
        child: Container(
          padding: EdgeInsets.all(AppSizes.lg),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary500),
              ),
              SizedBox(height: AppSizes.md),
              Text('Déconnexion en cours...'),
            ],
          ),
        ),
      ),
    );

    try {
      // Perform logout
      await AuthService().logout();

      // Close loading dialog
      Navigator.of(context).pop();

      // Navigate to role selection
      Navigator.of(context).pushNamedAndRemoveUntil(
        '/role-selection',
        (route) => false,
      );
    } catch (e) {
      // Close loading dialog
      Navigator.of(context).pop();

      // Force navigation anyway
      Navigator.of(context).pushNamedAndRemoveUntil(
        '/role-selection',
        (route) => false,
      );
    }
  }
}