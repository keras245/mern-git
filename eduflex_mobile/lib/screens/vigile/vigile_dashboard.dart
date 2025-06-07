import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import 'scanner_qr_screen.dart';
import 'historique_acces_screen.dart';
import 'profil_vigile_screen.dart';

class VigileScreen extends StatefulWidget {
  @override
  _VigileScreenState createState() => _VigileScreenState();
}

class _VigileScreenState extends State<VigileScreen> {
  int _selectedIndex = 0;
  final ApiService _apiService = ApiService();

  final List<Widget> _pages = [
    VigileHomeScreen(),
    ScannerQRScreen(),
    HistoriqueAccesScreen(),
    ProfilVigileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final vigile = authService.vigile;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.vigile,
              AppColors.vigile.withOpacity(0.8),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(vigile),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.gray50,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(AppSizes.radiusXl),
                      topRight: Radius.circular(AppSizes.radiusXl),
                    ),
                  ),
                  child: _pages[_selectedIndex],
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNavigation(),
    );
  }

  Widget _buildHeader(dynamic vigile) {
    final nom = vigile?.nom ?? 'Vigile';
    final prenom = vigile?.prenom ?? '';
    final poste = vigile?.poste ?? 'Contrôle d\'accès';

    return Container(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: AppColors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Center(
              child: Text('🛡️', style: TextStyle(fontSize: 30)),
            ),
          ),
          SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  prenom.isNotEmpty ? 'Salut $prenom !' : 'Salut $nom !',
                  style: AppTextStyles.headingMedium.copyWith(
                    color: AppColors.white,
                  ),
                ),
                Text(
                  'Poste: $poste',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            icon: Icon(Icons.account_circle_rounded, color: AppColors.white),
            onSelected: (value) {
              if (value == 'logout') {
                _handleLogout(context);
              }
            },
            itemBuilder: (BuildContext context) => [
              PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    Icon(Icons.person_rounded, color: AppColors.gray600),
                    SizedBox(width: AppSizes.sm),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          prenom.isNotEmpty && nom.isNotEmpty
                              ? '$prenom $nom'
                              : 'Vigile',
                          style: AppTextStyles.labelMedium,
                        ),
                        Text(
                          poste,
                          style: AppTextStyles.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              PopupMenuDivider(),
              PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout_rounded, color: AppColors.danger),
                    SizedBox(width: AppSizes.sm),
                    Text('Déconnexion'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavigation() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.gray200.withOpacity(0.5),
            blurRadius: 10,
            offset: Offset(0, -5),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.vigile,
        unselectedItemColor: AppColors.gray400,
        backgroundColor: AppColors.white,
        elevation: 0,
        selectedLabelStyle:
            TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontSize: 11),
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_rounded),
            activeIcon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.vigile.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.dashboard_rounded),
            ),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code_scanner_rounded),
            activeIcon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.vigile.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.qr_code_scanner_rounded),
            ),
            label: 'Scanner',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history_rounded),
            activeIcon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.vigile.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.history_rounded),
            ),
            label: 'Historique',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            activeIcon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.vigile.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.person_rounded),
            ),
            label: 'Profil',
          ),
        ],
      ),
    );
  }

  void _handleLogout(BuildContext context) {
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

// 🏠 ÉCRAN D'ACCUEIL VIGILE
class VigileHomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final vigile = authService.vigile;

    final prenom = vigile?.prenom ?? '';
    final nom = vigile?.nom ?? 'Vigile';
    final poste = vigile?.poste ?? 'Contrôle d\'accès';

    return SingleChildScrollView(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(AppSizes.xl),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.vigile,
                  AppColors.vigile.withOpacity(0.8),
                  AppColors.vigile.withOpacity(0.6),
                ],
              ),
              borderRadius: BorderRadius.circular(AppSizes.radiusXl),
              boxShadow: [
                BoxShadow(
                  color: AppColors.vigile.withOpacity(0.3),
                  blurRadius: 20,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        color: AppColors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(35),
                        border: Border.all(
                          color: AppColors.white.withOpacity(0.3),
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: Text('🛡️', style: TextStyle(fontSize: 28)),
                      ),
                    ),
                    SizedBox(width: AppSizes.lg),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Bienvenue,',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.white.withOpacity(0.9),
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            prenom.isNotEmpty && nom.isNotEmpty
                                ? '$prenom $nom'
                                : nom,
                            style: AppTextStyles.headingLarge.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 2),
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: AppSizes.sm,
                              vertical: AppSizes.xs,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.white.withOpacity(0.2),
                              borderRadius:
                                  BorderRadius.circular(AppSizes.radiusSm),
                            ),
                            child: Text(
                              'Vigile • $poste',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.white,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: AppSizes.lg),
                Container(
                  padding: EdgeInsets.all(AppSizes.md),
                  decoration: BoxDecoration(
                    color: AppColors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.security_rounded,
                          color: AppColors.white, size: 20),
                      SizedBox(width: AppSizes.sm),
                      Text(
                        'Contrôle d\'accès sécurisé',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: AppSizes.xl),
          Text(
            'Action Principale',
            style: AppTextStyles.headingMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.gray800,
            ),
          ),
          SizedBox(height: AppSizes.lg),
          _buildScannerButton(context),
          SizedBox(height: AppSizes.xl),
          Text(
            'Accès Rapides',
            style: AppTextStyles.headingMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.gray800,
            ),
          ),
          SizedBox(height: AppSizes.lg),
          Row(
            children: [
              Expanded(
                child: _buildQuickActionCard(
                  title: 'Historique',
                  subtitle: 'Voir les scans',
                  icon: Icons.history_rounded,
                  color: AppColors.primary500,
                  onTap: () => _navigateToTab(context, 2),
                ),
              ),
              SizedBox(width: AppSizes.md),
              Expanded(
                child: _buildQuickActionCard(
                  title: 'Profil',
                  subtitle: 'Mes infos',
                  icon: Icons.person_rounded,
                  color: AppColors.vigile,
                  onTap: () => _navigateToTab(context, 3),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildScannerButton(BuildContext context) {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      ),
      child: InkWell(
        onTap: () => _navigateToTab(context, 1),
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
        child: Container(
          padding: EdgeInsets.all(AppSizes.xl),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.vigile,
                AppColors.vigile.withOpacity(0.8),
              ],
            ),
            borderRadius: BorderRadius.circular(AppSizes.radiusXl),
          ),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: AppColors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: Icon(
                  Icons.qr_code_scanner_rounded,
                  color: AppColors.white,
                  size: 30,
                ),
              ),
              SizedBox(width: AppSizes.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SCANNER QR CODE',
                      style: AppTextStyles.headingMedium.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Vérifier l\'accès des étudiants',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios_rounded,
                color: AppColors.white,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        child: Container(
          padding: EdgeInsets.all(AppSizes.lg),
          child: Column(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              SizedBox(height: AppSizes.md),
              Text(
                title,
                style: AppTextStyles.labelMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: AppSizes.xs),
              Text(
                subtitle,
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.gray600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToTab(BuildContext context, int index) {
    final dashboard = context.findAncestorStateOfType<_VigileScreenState>();
    dashboard?.setState(() {
      dashboard._selectedIndex = index;
    });
  }
}
