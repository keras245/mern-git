import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';

class ProfilVigileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AuthService>(
      builder: (context, authService, child) {
        final vigile = authService.vigile;

        return SingleChildScrollView(
          padding: EdgeInsets.all(AppSizes.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: AppSizes.md),
              Text(
                'Mon Profil',
                style: AppTextStyles.headingLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.gray800,
                ),
              ),
              SizedBox(height: AppSizes.lg),
              _buildProfileCard(vigile),
              SizedBox(height: AppSizes.xl),
              _buildInfoSection(vigile),
              SizedBox(height: AppSizes.xl),
              _buildLogoutButton(context),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProfileCard(dynamic vigile) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.xl),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppSizes.radiusXl),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.vigile,
              AppColors.vigile.withOpacity(0.8),
            ],
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(40),
                border: Border.all(
                  color: AppColors.white.withOpacity(0.3),
                  width: 3,
                ),
              ),
              child: Center(
                child: Text('🛡️', style: TextStyle(fontSize: 40)),
              ),
            ),
            SizedBox(height: AppSizes.lg),
            Text(
              '${vigile?.prenom ?? ''} ${vigile?.nom ?? 'Vigile'}',
              style: AppTextStyles.headingLarge.copyWith(
                color: AppColors.white,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: AppSizes.sm),
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: AppSizes.md,
                vertical: AppSizes.sm,
              ),
              decoration: BoxDecoration(
                color: AppColors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(AppSizes.radiusSm),
              ),
              child: Text(
                vigile?.poste ?? 'Contrôle d\'accès',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoSection(dynamic vigile) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Padding(
        padding: EdgeInsets.all(AppSizes.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Informations Personnelles',
              style: AppTextStyles.headingMedium.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.gray800,
              ),
            ),
            SizedBox(height: AppSizes.lg),
            _buildInfoRow(
              Icons.person_rounded,
              'Nom complet',
              '${vigile?.prenom ?? ''} ${vigile?.nom ?? 'Non défini'}',
            ),
            _buildInfoRow(
              Icons.phone_rounded,
              'Téléphone',
              vigile?.telephone ?? 'Non défini',
            ),
            _buildInfoRow(
              Icons.work_rounded,
              'Poste',
              vigile?.poste ?? 'Contrôle d\'accès',
            ),
            _buildInfoRow(
              Icons.security_rounded,
              'Code d\'accès',
              '••••••',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: AppSizes.lg),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.vigile.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: AppColors.vigile, size: 20),
          ),
          SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.gray600,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  value,
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: () => _showLogoutDialog(context),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.danger,
          foregroundColor: AppColors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          elevation: 2,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.logout_rounded),
            SizedBox(width: AppSizes.sm),
            Text(
              'Se déconnecter',
              style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
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

                try {
                  await AuthService().logout();
                  Navigator.of(context).pushNamedAndRemoveUntil(
                      '/role-selection', (route) => false);
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Erreur lors de la déconnexion'),
                      backgroundColor: AppColors.danger,
                    ),
                  );
                }
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
}
