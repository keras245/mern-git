import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import 'emploi_du_temps_screen.dart';
import 'qr_code_screen.dart';
import 'profil_etudiant_screen.dart';
import 'demande_presence_screen.dart';

class EtudiantDashboard extends StatefulWidget {
  @override
  _EtudiantDashboardState createState() => _EtudiantDashboardState();
}

class _EtudiantDashboardState extends State<EtudiantDashboard> {
  int _selectedIndex = 0;
  final ApiService _apiService = ApiService();

  final List<Widget> _pages = [
    EtudiantHomeScreen(),
    EmploiDuTempsScreen(),
    QRCodeScreen(),
    ProfilEtudiantScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final etudiant = authService.etudiant;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.etudiant,
              AppColors.etudiant.withOpacity(0.8),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(etudiant),
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

  Widget _buildHeader(dynamic etudiant) {
    final nom = etudiant?.nom ?? 'Étudiant';
    final prenom = etudiant?.prenom ?? '';
    final matricule = etudiant?.matricule ?? '';

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
              child: Text('🎓', style: TextStyle(fontSize: 30)),
            ),
          ),
          SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  prenom.isNotEmpty && nom.isNotEmpty
                      ? 'Salut $prenom !'
                      : 'Salut $nom !',
                  style: AppTextStyles.headingMedium.copyWith(
                    color: AppColors.white,
                  ),
                ),
                Text(
                  'Matricule: $matricule',
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
                              : 'Étudiant',
                          style: AppTextStyles.labelMedium,
                        ),
                        Text(
                          matricule,
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
        selectedItemColor: AppColors.etudiant,
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
                color: AppColors.etudiant.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.dashboard_rounded),
            ),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.schedule_rounded),
            activeIcon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.etudiant.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.schedule_rounded),
            ),
            label: 'Planning',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code_rounded),
            activeIcon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.etudiant.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.qr_code_rounded),
            ),
            label: 'QR Code',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            activeIcon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.etudiant.withOpacity(0.1),
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

// 🏠 ÉCRAN D'ACCUEIL ÉTUDIANT
class EtudiantHomeScreen extends StatefulWidget {
  @override
  _EtudiantHomeScreenState createState() => _EtudiantHomeScreenState();
}

class _EtudiantHomeScreenState extends State<EtudiantHomeScreen> {
  Map<String, dynamic>? userData;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  _loadUserData() async {
    try {
      final apiService = ApiService();
      final data = await apiService.getProfilEtudiant();

      setState(() {
        userData = data['etudiant'];
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(
          child: CircularProgressIndicator(color: AppColors.etudiant));
    }

    if (error != null) {
      return Center(
        child: Card(
          margin: EdgeInsets.all(AppSizes.lg),
          child: Padding(
            padding: EdgeInsets.all(AppSizes.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.error, color: AppColors.danger, size: 48),
                SizedBox(height: AppSizes.md),
                Text('Erreur de chargement', style: AppTextStyles.headingSmall),
                SizedBox(height: AppSizes.sm),
                Text(error!, style: AppTextStyles.bodySmall),
                SizedBox(height: AppSizes.md),
                ElevatedButton(
                  onPressed: _loadUserData,
                  child: Text('Réessayer'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.etudiant),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDateTimeCard(),
          SizedBox(height: AppSizes.xl),
          _buildFunctionalityGrid(),
          SizedBox(height: AppSizes.xl),
          _buildQuickInfo(),
        ],
      ),
    );
  }

  Widget _buildDateTimeCard() {
    final now = DateTime.now();
    final dateString =
        '${now.day.toString().padLeft(2, '0')}/${now.month.toString().padLeft(2, '0')}/${now.year}';
    final timeString =
        '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(AppSizes.xl),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.etudiant,
            AppColors.etudiant.withOpacity(0.8),
            AppColors.etudiant.withOpacity(0.6),
          ],
        ),
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
        boxShadow: [
          BoxShadow(
            color: AppColors.etudiant.withOpacity(0.3),
            blurRadius: 20,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Column(
            children: [
              Icon(Icons.calendar_today, color: AppColors.white, size: 24),
              SizedBox(height: AppSizes.sm),
              Text(
                'Date',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.white.withOpacity(0.8),
                ),
              ),
              Text(
                dateString,
                style: AppTextStyles.headingSmall.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          Container(
              width: 1, height: 60, color: AppColors.white.withOpacity(0.3)),
          Column(
            children: [
              Icon(Icons.access_time, color: AppColors.white, size: 24),
              SizedBox(height: AppSizes.sm),
              Text(
                'Heure',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.white.withOpacity(0.8),
                ),
              ),
              Text(
                timeString,
                style: AppTextStyles.headingSmall.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFunctionalityGrid() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Actions Rapides',
          style: AppTextStyles.headingMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.gray800,
          ),
        ),
        SizedBox(height: AppSizes.lg),
        _buildActionCard(
          title: 'Emploi du temps',
          subtitle: 'Consulter mes cours',
          icon: Icons.schedule_rounded,
          color: AppColors.primary500,
          onTap: () => _navigateToTab(1),
        ),
        SizedBox(height: AppSizes.md),
        _buildActionCard(
          title: 'Mon QR Code',
          subtitle: 'Code d\'accès à la faculté',
          icon: Icons.qr_code_rounded,
          color: AppColors.success,
          onTap: () => _navigateToTab(2),
        ),
        SizedBox(height: AppSizes.md),
        _buildActionCard(
          title: 'Déclaration Présence',
          subtitle: 'Signaler ma présence en cours',
          icon: Icons.check_circle_rounded,
          color: AppColors.warning,
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => DemandePresenceScreen()),
          ),
        ),
      ],
    );
  }

  Widget _buildActionCard({
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
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              SizedBox(width: AppSizes.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTextStyles.headingSmall),
                    Text(subtitle, style: AppTextStyles.bodySmall),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios, color: AppColors.gray400, size: 16),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToTab(int index) {
    final dashboard =
        context.findAncestorStateOfType<_EtudiantDashboardState>();
    dashboard?.setState(() {
      dashboard._selectedIndex = index;
    });
  }

  Widget _buildQuickInfo() {
    final matricule = userData?['matricule']?.toString() ?? 'N/A';
    final programme = userData?['programme_id'];
    final groupe = userData?['groupe']?.toString() ?? 'N/A';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Mes Informations',
          style: AppTextStyles.headingMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.gray800,
          ),
        ),
        SizedBox(height: AppSizes.lg),
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          child: Container(
            padding: EdgeInsets.all(AppSizes.lg),
            child: Column(
              children: [
                _buildInfoRow(Icons.school, 'Matricule', matricule),
                _buildInfoRow(
                    Icons.book, 'Programme', _buildProgrammeComplet(programme)),
                _buildInfoRow(Icons.group, 'Groupe', groupe),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: AppSizes.sm),
      child: Row(
        children: [
          Icon(icon, color: AppColors.etudiant, size: 20),
          SizedBox(width: AppSizes.sm),
          Expanded(
            child: Text(
              '$label: $value',
              style: AppTextStyles.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  String _buildProgrammeComplet(dynamic programme) {
    if (programme == null) return 'Programme non défini';
    final nom = programme['nom']?.toString() ?? 'Programme';
    final licence = programme['licence'];
    final semestre = programme['semestre'];

    if (licence != null && semestre != null) {
      return '$nom L$licence S$semestre';
    }
    return nom;
  }
}
