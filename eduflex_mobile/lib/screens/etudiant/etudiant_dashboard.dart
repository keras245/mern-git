import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import 'emploi_du_temps_screen.dart';
import 'qr_code_screen.dart';
import 'demande_presence_screen.dart';
import 'profil_etudiant_screen.dart';

class EtudiantDashboard extends StatefulWidget {
  @override
  _EtudiantDashboardState createState() => _EtudiantDashboardState();
}

class _EtudiantDashboardState extends State<EtudiantDashboard> {
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
        userData = data;
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
          child: isLoading
              ? Center(child: CircularProgressIndicator(color: AppColors.white))
              : error != null
                  ? _buildError()
                  : Column(
                      children: [
                        _buildHeader(),
                        _buildDateTimeCard(),
                        Expanded(child: _buildContent()),
                      ],
                    ),
        ),
      ),
    );
  }

  Widget _buildError() {
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
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
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
                  'Salut ${userData?['nom'] ?? 'Étudiant'} !',
                  style: AppTextStyles.headingMedium.copyWith(
                    color: AppColors.white,
                  ),
                ),
                Text(
                  _buildProgrammeComplet(userData?['programme']),
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ProfilEtudiantScreen()),
            ),
            icon: Icon(Icons.person, color: AppColors.white),
          ),
        ],
      ),
    );
  }

  Widget _buildDateTimeCard() {
    final now = DateTime.now();
    final dateFormatter = DateFormat('dd/MM/yyyy');
    final timeFormatter = DateFormat('HH:mm');

    final jours = [
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
      'Dimanche'
    ];
    final mois = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Jun',
      'Jul',
      'Aoû',
      'Sep',
      'Oct',
      'Nov',
      'Déc'
    ];

    final jourNom = jours[now.weekday - 1];
    final moisNom = mois[now.month - 1];
    final dateComplete = '$jourNom ${now.day} $moisNom ${now.year}';

    return Container(
      margin: EdgeInsets.symmetric(horizontal: AppSizes.lg),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        ),
        child: Container(
          padding: EdgeInsets.all(AppSizes.md),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Column(
                children: [
                  Icon(Icons.calendar_today,
                      color: AppColors.etudiant, size: 20),
                  SizedBox(height: 4),
                  Text(
                    dateComplete,
                    style: AppTextStyles.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              Container(
                width: 1,
                height: 40,
                color: AppColors.gray300,
              ),
              Column(
                children: [
                  Icon(Icons.access_time, color: AppColors.etudiant, size: 20),
                  SizedBox(height: 4),
                  Text(
                    timeFormatter.format(now),
                    style: AppTextStyles.headingSmall.copyWith(
                      color: AppColors.etudiant,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _buildProgrammeComplet(dynamic programme) {
    if (programme == null) return 'Programme';

    final nom = programme['nom'] ?? 'Programme';
    final licence = programme['licence'];
    final semestre = programme['semestre'];

    if (licence != null && semestre != null) {
      return '$nom Licence $licence Semestre $semestre';
    }

    return nom;
  }

  Widget _buildContent() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.gray50,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(AppSizes.radiusXl),
          topRight: Radius.circular(AppSizes.radiusXl),
        ),
      ),
      child: SingleChildScrollView(
        padding: EdgeInsets.all(AppSizes.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: AppSizes.md),
            Text(
              'Mes Fonctionnalités',
              style: AppTextStyles.headingMedium,
            ),
            SizedBox(height: AppSizes.lg),
            _buildFunctionalityGrid(),
            SizedBox(height: AppSizes.xl),
            _buildQuickInfo(),
          ],
        ),
      ),
    );
  }

  Widget _buildFunctionalityGrid() {
    final functionalities = [
      {
        'title': 'Emploi du temps',
        'subtitle': 'Consulter mes cours',
        'icon': Icons.schedule,
        'color': AppColors.primary500,
        'onTap': () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => EmploiDuTempsScreen()),
            ),
      },
      {
        'title': 'Mon QR Code',
        'subtitle': 'Code d\'accès',
        'icon': Icons.qr_code,
        'color': AppColors.success,
        'onTap': () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => QRCodeScreen()),
            ),
      },
      {
        'title': 'Déclaration Présence',
        'subtitle': 'Signaler ma présence',
        'icon': Icons.check_circle,
        'color': AppColors.warning,
        'onTap': () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => DemandePresenceScreen()),
            ),
      },
    ];

    return Column(
      children: functionalities.map((func) {
        return Container(
          margin: EdgeInsets.only(bottom: AppSizes.md),
          child: Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
            ),
            child: InkWell(
              onTap: func['onTap'] as VoidCallback,
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              child: Container(
                padding: EdgeInsets.all(AppSizes.lg),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: (func['color'] as Color).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        func['icon'] as IconData,
                        color: func['color'] as Color,
                        size: 24,
                      ),
                    ),
                    SizedBox(width: AppSizes.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            func['title'] as String,
                            style: AppTextStyles.headingSmall,
                          ),
                          Text(
                            func['subtitle'] as String,
                            style: AppTextStyles.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.arrow_forward_ios,
                      color: AppColors.gray400,
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildQuickInfo() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Informations Rapides',
              style: AppTextStyles.headingSmall,
            ),
            SizedBox(height: AppSizes.md),
            Row(
              children: [
                Icon(Icons.school, color: AppColors.etudiant, size: 20),
                SizedBox(width: AppSizes.sm),
                Text(
                  'Matricule: ${userData?['matricule'] ?? 'N/A'}',
                  style: AppTextStyles.bodyMedium,
                ),
              ],
            ),
            SizedBox(height: AppSizes.sm),
            Row(
              children: [
                Icon(Icons.book, color: AppColors.etudiant, size: 20),
                SizedBox(width: AppSizes.sm),
                Expanded(
                  child: Text(
                    _buildProgrammeComplet(userData?['programme']),
                    style: AppTextStyles.bodyMedium,
                  ),
                ),
              ],
            ),
            SizedBox(height: AppSizes.sm),
            Row(
              children: [
                Icon(Icons.group, color: AppColors.etudiant, size: 20),
                SizedBox(width: AppSizes.sm),
                Text(
                  'Groupe: ${userData?['groupe'] ?? 'N/A'}',
                  style: AppTextStyles.bodyMedium,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
