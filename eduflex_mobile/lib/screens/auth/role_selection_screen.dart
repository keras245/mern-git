import 'package:flutter/material.dart';
import '../../utils/constants.dart';
import 'login_screen.dart';

class RoleSelectionScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary50,
              AppColors.white,
              AppColors.primary100,
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(AppSizes.lg),
            child: Column(
              children: [
                SizedBox(height: AppSizes.xl),

                // Header avec logo et titre
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo animé
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(AppSizes.radius2Xl),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary500.withOpacity(0.3),
                            blurRadius: 20,
                            offset: Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.school_rounded,
                        size: 50,
                        color: AppColors.white,
                      ),
                    ),
                    SizedBox(height: AppSizes.lg),
                    Text(
                      'EduFlex Mobile',
                      style: AppTextStyles.headingLarge.copyWith(
                        color: AppColors.gray900,
                      ),
                    ),
                    SizedBox(height: AppSizes.sm),
                    Text(
                      'Sélectionnez votre rôle pour continuer',
                      style: AppTextStyles.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),

                SizedBox(height: AppSizes.xxl),

                // Cartes de sélection de rôle
                Column(
                  children: [
                    _buildRoleCard(
                      context,
                      title: 'Comptable',
                      description: 'Gestion des paiements étudiants',
                      icon: '💰',
                      gradient: AppColors.comptableGradient,
                      userType: 'comptable',
                    ),
                    SizedBox(height: AppSizes.md),
                    _buildRoleCard(
                      context,
                      title: 'Vigile',
                      description: 'Contrôle d\'accès par scanner QR',
                      icon: '🔍',
                      gradient: AppColors.vigileGradient,
                      userType: 'vigile',
                    ),
                    SizedBox(height: AppSizes.md),
                    _buildRoleCard(
                      context,
                      title: 'Étudiant',
                      description: 'Affichage QR et signalement présence',
                      icon: '🎓',
                      gradient: AppColors.etudiantGradient,
                      userType: 'etudiant',
                    ),
                  ],
                ),

                SizedBox(height: AppSizes.xxl),

                // Footer
                Text(
                  '© 2024 EduFlex. Tous droits réservés.',
                  style: AppTextStyles.bodySmall,
                  textAlign: TextAlign.center,
                ),

                SizedBox(height: AppSizes.lg),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleCard(
    BuildContext context, {
    required String title,
    required String description,
    required String icon,
    required Gradient gradient,
    required String userType,
  }) {
    return Container(
      width: double.infinity,
      constraints: BoxConstraints(maxWidth: 400),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => LoginScreen(userType: userType),
              ),
            );
          },
          borderRadius: BorderRadius.circular(AppSizes.radiusXl),
          child: Container(
            padding: EdgeInsets.all(AppSizes.lg),
            decoration: BoxDecoration(
              color: AppColors.white.withOpacity(0.8),
              borderRadius: BorderRadius.circular(AppSizes.radiusXl),
              border: Border.all(
                color: AppColors.white.withOpacity(0.5),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.gray200.withOpacity(0.5),
                  blurRadius: 10,
                  offset: Offset(0, 5),
                ),
              ],
            ),
            child: Row(
              children: [
                // Icône avec gradient
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    gradient: gradient,
                    borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                  ),
                  child: Center(
                    child: Text(
                      icon,
                      style: TextStyle(fontSize: 24),
                    ),
                  ),
                ),
                SizedBox(width: AppSizes.md),
                // Texte
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: AppTextStyles.headingSmall,
                      ),
                      SizedBox(height: AppSizes.xs),
                      Text(
                        description,
                        style: AppTextStyles.bodySmall,
                      ),
                    ],
                  ),
                ),
                // Flèche
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: AppColors.gray400,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
