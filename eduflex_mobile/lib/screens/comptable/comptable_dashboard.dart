import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../models/etudiant.dart';
import 'gestion_paiements.dart';
import 'recherche_etudiant.dart';
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
    RechercheEtudiant(),
    GestionUtilisateurs(),
  ];

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final comptable = authService.comptable;

    return Scaffold(
      appBar: AppBar(
        title: Text('Dashboard Comptable'),
        backgroundColor: AppColors.primary500,
        foregroundColor: AppColors.white,
        elevation: 0,
        actions: [
          PopupMenuButton<String>(
            icon: Icon(Icons.account_circle_rounded),
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
                          '${comptable?.prenom} ${comptable?.nom}',
                          style: AppTextStyles.labelMedium,
                        ),
                        Text(
                          comptable?.idComptable ?? '',
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
      body: _pages[_selectedIndex],
      bottomNavigationBar: Container(
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
          selectedItemColor: AppColors.primary500,
          unselectedItemColor: AppColors.gray400,
          backgroundColor: AppColors.white,
          elevation: 0,
          selectedLabelStyle: TextStyle(fontSize: 12),
          unselectedLabelStyle: TextStyle(fontSize: 11),
          items: [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_rounded),
              activeIcon: Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primary100,
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
                  color: AppColors.primary100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.payment_rounded),
              ),
              label: 'Paiements',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.search_rounded),
              activeIcon: Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primary100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.search_rounded),
              ),
              label: 'Recherche',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.admin_panel_settings_rounded),
              activeIcon: Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primary100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.admin_panel_settings_rounded),
              ),
              label: 'Gestion',
            ),
          ],
        ),
      ),
    );
  }

  void _handleLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          title: Text('Déconnexion'),
          content: Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                Provider.of<AuthService>(context, listen: false).logout();
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

class ComptableHomeScreen extends StatefulWidget {
  @override
  _ComptableHomeScreenState createState() => _ComptableHomeScreenState();
}

class _ComptableHomeScreenState extends State<ComptableHomeScreen> {
  final ApiService _apiService = ApiService();
  List<Etudiant> _etudiants = [];
  bool _isLoading = true;
  Map<String, dynamic> _statistiques = {};

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (!mounted) return;

    setState(() => _isLoading = true);

    try {
      final etudiantsData = await _apiService.getEtudiants();

      if (!mounted) return;

      final etudiants =
          etudiantsData.map((data) => Etudiant.fromJson(data)).toList();

      final totalEtudiants = etudiants.length;
      final etudiantsValides =
          etudiants.where((e) => e.statutCompte == 'valide').length;
      final etudiantsEnAttente =
          etudiants.where((e) => e.statutCompte == 'en_attente').length;

      setState(() {
        _etudiants = etudiants;
        _statistiques = {
          'total': totalEtudiants,
          'valides': etudiantsValides,
          'en_attente': etudiantsEnAttente,
          'suspendus': totalEtudiants - etudiantsValides - etudiantsEnAttente,
        };
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Connexion au serveur en cours...'),
          backgroundColor: AppColors.warning,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final comptable = authService.comptable;

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.all(AppSizes.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(AppSizes.lg),
              decoration: BoxDecoration(
                gradient: AppColors.comptableGradient,
                borderRadius: BorderRadius.circular(AppSizes.radiusXl),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: AppColors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: Center(
                          child: Text('💰', style: TextStyle(fontSize: 24)),
                        ),
                      ),
                      SizedBox(width: AppSizes.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Bienvenue,',
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.white.withOpacity(0.9),
                              ),
                            ),
                            Text(
                              '${comptable?.prenom} ${comptable?.nom}',
                              style: AppTextStyles.headingMedium.copyWith(
                                color: AppColors.white,
                              ),
                            ),
                            Text(
                              'Comptable - ${comptable?.idComptable}',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.white.withOpacity(0.8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(height: AppSizes.lg),
            Text(
              'Statistiques',
              style: AppTextStyles.headingSmall,
            ),
            SizedBox(height: AppSizes.md),
            if (_isLoading)
              Center(
                child: Column(
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: AppSizes.md),
                    Text('Chargement des données...'),
                  ],
                ),
              )
            else
              GridView.count(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: AppSizes.md,
                crossAxisSpacing: AppSizes.md,
                childAspectRatio: 1.2,
                children: [
                  _buildStatCard(
                    title: 'Total Étudiants',
                    value: '${_statistiques['total'] ?? 0}',
                    icon: Icons.people_rounded,
                    color: AppColors.info,
                  ),
                  _buildStatCard(
                    title: 'Comptes Validés',
                    value: '${_statistiques['valides'] ?? 0}',
                    icon: Icons.check_circle_rounded,
                    color: AppColors.success,
                  ),
                  _buildStatCard(
                    title: 'En Attente',
                    value: '${_statistiques['en_attente'] ?? 0}',
                    icon: Icons.pending_rounded,
                    color: AppColors.warning,
                  ),
                  _buildStatCard(
                    title: 'Suspendus',
                    value: '${_statistiques['suspendus'] ?? 0}',
                    icon: Icons.block_rounded,
                    color: AppColors.danger,
                  ),
                ],
              ),
            SizedBox(height: AppSizes.lg),
            Text(
              'Actions Rapides',
              style: AppTextStyles.headingSmall,
            ),
            SizedBox(height: AppSizes.md),
            Row(
              children: [
                Expanded(
                  child: _buildActionButton(
                    title: 'Nouveau Paiement',
                    icon: Icons.add_card_rounded,
                    onTap: () {
                      // Action pour nouveau paiement
                    },
                  ),
                ),
                SizedBox(width: AppSizes.md),
                Expanded(
                  child: _buildActionButton(
                    title: 'Rechercher',
                    icon: Icons.search_rounded,
                    onTap: () {
                      // Action pour recherche
                    },
                  ),
                ),
              ],
            ),
            SizedBox(height: AppSizes.lg),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Étudiants Récents',
                  style: AppTextStyles.headingSmall,
                ),
                TextButton(
                  onPressed: () {
                    // Aller vers la liste complète
                  },
                  child: Text('Voir tout'),
                ),
              ],
            ),
            SizedBox(height: AppSizes.md),
            if (_etudiants.isNotEmpty)
              ...(_etudiants
                  .take(3)
                  .map((etudiant) => _buildEtudiantCard(etudiant)))
            else if (!_isLoading)
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.wifi_off_rounded,
                      size: 48,
                      color: AppColors.gray400,
                    ),
                    SizedBox(height: AppSizes.md),
                    Text(
                      'Données non disponibles',
                      style: AppTextStyles.bodyMedium,
                    ),
                    Text(
                      'Vérifiez votre connexion',
                      style: AppTextStyles.bodySmall,
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(AppSizes.md),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        border: Border.all(color: AppColors.gray200),
        boxShadow: [
          BoxShadow(
            color: AppColors.gray100,
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          SizedBox(height: AppSizes.sm),
          Text(
            value,
            style: AppTextStyles.headingMedium.copyWith(color: color),
          ),
          SizedBox(height: AppSizes.xs),
          Text(
            title,
            style: AppTextStyles.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String title,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        child: Container(
          padding: EdgeInsets.all(AppSizes.md),
          decoration: BoxDecoration(
            color: AppColors.primary50,
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
            border: Border.all(color: AppColors.primary200),
          ),
          child: Column(
            children: [
              Icon(icon, color: AppColors.primary500, size: 32),
              SizedBox(height: AppSizes.sm),
              Text(
                title,
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.primary700,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEtudiantCard(Etudiant etudiant) {
    Color statusColor;
    String statusText;

    switch (etudiant.statutCompte) {
      case 'valide':
        statusColor = AppColors.success;
        statusText = 'Validé';
        break;
      case 'en_attente':
        statusColor = AppColors.warning;
        statusText = 'En attente';
        break;
      default:
        statusColor = AppColors.danger;
        statusText = 'Suspendu';
    }

    return Container(
      margin: EdgeInsets.only(bottom: AppSizes.md),
      padding: EdgeInsets.all(AppSizes.md),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: AppColors.primary100,
            child: Text(
              '${etudiant.prenom[0]}${etudiant.nom[0]}',
              style: AppTextStyles.labelMedium.copyWith(
                color: AppColors.primary700,
              ),
            ),
          ),
          SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${etudiant.prenom} ${etudiant.nom}',
                  style: AppTextStyles.labelMedium,
                ),
                Text(
                  etudiant.matricule,
                  style: AppTextStyles.bodySmall,
                ),
                Text(
                  etudiant.programme?.nom ?? 'Programme non défini',
                  style: AppTextStyles.bodySmall,
                ),
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: AppSizes.sm,
              vertical: AppSizes.xs,
            ),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppSizes.radiusSm),
            ),
            child: Text(
              statusText,
              style: AppTextStyles.bodySmall.copyWith(
                color: statusColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
