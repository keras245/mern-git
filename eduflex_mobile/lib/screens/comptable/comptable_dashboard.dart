import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/etudiant.dart';
import 'gestion_paiements.dart';
import 'gestion_utilisateurs.dart';

class ComptableDashboard extends StatefulWidget {
  @override
  _ComptableDashboardState createState() => _ComptableDashboardState();
}

class _ComptableDashboardState extends State<ComptableDashboard> {
  int _selectedIndex = 0;
  final ApiService _apiService = ApiService();

  final List<Widget> _pages = [
    ComptableHomeScreen(),
    GestionPaiements(),
    GestionUtilisateurs(),
  ];

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final comptable = authService.comptable;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.comptable,
              AppColors.comptable.withOpacity(0.8),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(comptable),
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

  Widget _buildHeader(dynamic comptable) {
    final nom = comptable?.nom ?? 'Comptable';
    final prenom = comptable?.prenom ?? '';
    final idComptable = comptable?.idComptable ?? '';

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
              child: Text('💰', style: TextStyle(fontSize: 30)),
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
                  'Gestion des paiements',
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
                              : 'Comptable',
                          style: AppTextStyles.labelMedium,
                        ),
                        Text(
                          idComptable.isNotEmpty
                              ? idComptable
                              : 'ID non défini',
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
        selectedItemColor: AppColors.comptable,
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
                color: AppColors.comptable.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.dashboard_rounded),
            ),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.payment_rounded),
            activeIcon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.comptable.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.payment_rounded),
            ),
            label: 'Paiements',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_rounded),
            activeIcon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.comptable.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.people_rounded),
            ),
            label: 'Gestion',
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

  void changeTab(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }
}

// 🏠 ÉCRAN D'ACCUEIL COMPTABLE
class ComptableHomeScreen extends StatefulWidget {
  @override
  _ComptableHomeScreenState createState() => _ComptableHomeScreenState();
}

class _ComptableHomeScreenState extends State<ComptableHomeScreen> {
  void _navigateToTab(int index) {
    final dashboard =
        context.findAncestorStateOfType<_ComptableDashboardState>();
    dashboard?.changeTab(index);
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final comptable = authService.comptable;

    final prenom = comptable?.prenom ?? '';
    final nom = comptable?.nom ?? 'Comptable';
    final idComptable = comptable?.idComptable ?? '';

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
                  AppColors.comptable,
                  AppColors.comptable.withOpacity(0.8),
                  AppColors.comptable.withOpacity(0.6),
                ],
              ),
              borderRadius: BorderRadius.circular(AppSizes.radiusXl),
              boxShadow: [
                BoxShadow(
                  color: AppColors.comptable.withOpacity(0.3),
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
                        child: Text('💰', style: TextStyle(fontSize: 28)),
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
                              idComptable.isNotEmpty
                                  ? 'Comptable • $idComptable'
                                  : 'Comptable',
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
                      Icon(Icons.trending_up_rounded,
                          color: AppColors.white, size: 20),
                      SizedBox(width: AppSizes.sm),
                      Text(
                        'Tableau de bord des paiements',
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
            'Actions Rapides',
            style: AppTextStyles.headingMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.gray800,
            ),
          ),
          SizedBox(height: AppSizes.lg),

          // Actions Grid
          GridView.count(
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: AppSizes.md,
            crossAxisSpacing: AppSizes.md,
            childAspectRatio: 1.2,
            children: [
              _buildModernActionCard(
                title: 'Nouveau Paiement',
                subtitle: 'Enregistrer un paiement',
                icon: Icons.add_card_rounded,
                gradient: LinearGradient(
                  colors: [
                    AppColors.success,
                    AppColors.success.withOpacity(0.7)
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                onTap: () => _navigateToTab(1),
              ),
              _buildModernActionCard(
                title: 'Rechercher',
                subtitle: 'Trouver un étudiant',
                icon: Icons.search_rounded,
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary500,
                    AppColors.primary500.withOpacity(0.7)
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                onTap: () => _navigateToTab(1),
              ),
              _buildModernActionCard(
                title: 'Gestion',
                subtitle: 'Gérer les utilisateurs',
                icon: Icons.people_rounded,
                gradient: LinearGradient(
                  colors: [
                    AppColors.comptable,
                    AppColors.comptable.withOpacity(0.7)
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                onTap: () => _navigateToTab(2),
              ),
              _buildModernActionCard(
                title: 'Statistiques',
                subtitle: 'Voir les rapports',
                icon: Icons.bar_chart_rounded,
                gradient: LinearGradient(
                  colors: [
                    AppColors.warning,
                    AppColors.warning.withOpacity(0.7)
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                onTap: () => _navigateToTab(1),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildModernActionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Gradient gradient,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
        child: Container(
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: BorderRadius.circular(AppSizes.radiusXl),
          ),
          child: Padding(
            padding: EdgeInsets.all(AppSizes.lg),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: AppColors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: Icon(icon, color: AppColors.white, size: 24),
                ),
                SizedBox(height: AppSizes.md),
                Text(
                  title,
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: AppSizes.xs),
                Text(
                  subtitle,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.white.withOpacity(0.9),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
