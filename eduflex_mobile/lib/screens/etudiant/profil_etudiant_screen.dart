import 'package:flutter/material.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';

class ProfilEtudiantScreen extends StatefulWidget {
  @override
  _ProfilEtudiantScreenState createState() => _ProfilEtudiantScreenState();
}

class _ProfilEtudiantScreenState extends State<ProfilEtudiantScreen> {
  Map<String, dynamic>? profil;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadProfil();
  }

  _loadProfil() async {
    try {
      final apiService = ApiService();
      final data = await apiService.getProfilEtudiant();

      print('🔍 Données profil reçues:');
      print(data);

      setState(() {
        profil = data;
        isLoading = false;
      });
    } catch (e) {
      print('❌ Erreur chargement profil: $e');
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  _logout() async {
    try {
      print('🔄 [LOGOUT_ETUDIANT] Début de la déconnexion...');

      await AuthService().logout();
      print('✅ [LOGOUT_ETUDIANT] Déconnexion AuthService réussie');

      if (!mounted) {
        print('⚠️ [LOGOUT_ETUDIANT] Widget démonté, arrêt de la navigation');
        return;
      }

      print('🔄 [LOGOUT_ETUDIANT] Redirection vers /role-selection...');

      Navigator.of(context).pushNamedAndRemoveUntil(
        '/role-selection',
        (route) => false,
      );

      print('✅ [LOGOUT_ETUDIANT] Redirection réussie');
    } catch (e) {
      print('❌ [LOGOUT_ETUDIANT] Erreur lors de la déconnexion: $e');
      print('📝 [LOGOUT_ETUDIANT] Stack trace: ${StackTrace.current}');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur de déconnexion: ${e.toString()}'),
            backgroundColor: AppColors.danger,
            duration: Duration(seconds: 5),
            action: SnackBarAction(
              label: 'Réessayer',
              textColor: AppColors.white,
              onPressed: _logout,
            ),
          ),
        );
      }
    }
  }

  String _safeString(dynamic value) {
    if (value == null) return 'N/A';
    return value.toString();
  }

  @override
  Widget build(BuildContext context) {
    print('🔄 [PROFIL_ETUDIANT] Build - isLoading: $isLoading, error: $error');

    return Scaffold(
      appBar: AppBar(
        title: Text('Mon Profil'),
        backgroundColor: AppColors.etudiant,
        foregroundColor: AppColors.white,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {
              print('🔄 [PROFIL_ETUDIANT] Clic sur bouton déconnexion');
              _logout();
            },
            icon: Icon(Icons.logout),
            tooltip: 'Se déconnecter',
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.etudiant,
              AppColors.etudiant.withOpacity(0.1),
            ],
            stops: [0.0, 0.3],
          ),
        ),
        child: isLoading
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(color: AppColors.white),
                    SizedBox(height: AppSizes.md),
                    Text(
                      'Chargement du profil...',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.white,
                      ),
                    ),
                  ],
                ),
              )
            : error != null
                ? _buildError()
                : _buildProfil(),
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
              Text(
                error!,
                style: AppTextStyles.bodySmall,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: AppSizes.md),
              ElevatedButton(
                onPressed: () {
                  print('🔄 [PROFIL_ETUDIANT] Clic sur Réessayer');
                  _loadProfil();
                },
                child: Text('Réessayer'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.etudiant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfil() {
    final etudiant = profil!['etudiant'];
    final presences =
        List<Map<String, dynamic>>.from(profil!['dernieres_presences'] ?? []);

    return SingleChildScrollView(
      child: Column(
        children: [
          _buildProfileHeader(etudiant),
          Container(
            margin: EdgeInsets.only(top: AppSizes.lg),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(AppSizes.radius2Xl),
                topRight: Radius.circular(AppSizes.radius2Xl),
              ),
            ),
            child: Column(
              children: [
                SizedBox(height: AppSizes.lg),
                _buildInfoSection(etudiant),
                _buildPresencesSection(presences),
                SizedBox(height: AppSizes.xl),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileHeader(Map<String, dynamic> etudiant) {
    return Container(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Column(
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(50),
            ),
            child: Center(
              child: Text('🎓', style: TextStyle(fontSize: 50)),
            ),
          ),
          SizedBox(height: AppSizes.md),
          Text(
            '${_safeString(etudiant['prenom'])} ${_safeString(etudiant['nom'])}',
            style: AppTextStyles.headingLarge.copyWith(
              color: AppColors.white,
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
              'Matricule: ${_safeString(etudiant['matricule'])}',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(Map<String, dynamic> etudiant) {
    return Container(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        ),
        child: Container(
          padding: EdgeInsets.all(AppSizes.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Informations Personnelles',
                style: AppTextStyles.headingSmall,
              ),
              SizedBox(height: AppSizes.lg),
              _buildInfoRow(
                  Icons.email, 'Email', _safeString(etudiant['email'])),
              _buildInfoRow(
                  Icons.phone, 'Téléphone', _safeString(etudiant['telephone'])),
              _buildInfoRow(Icons.school, 'Programme',
                  _buildProgrammeText(etudiant['programme_id'])),
              _buildInfoRow(
                  Icons.group, 'Groupe', _safeString(etudiant['groupe'])),
              _buildPaiementRow(etudiant['pourcentage_paiement'] ?? 0,
                  etudiant['pourcentage_paiement_seuil'] ?? 75),
              _buildInfoRow(Icons.verified, 'Statut',
                  _getStatutText(etudiant['statut_compte'])),
            ],
          ),
        ),
      ),
    );
  }

  String _buildProgrammeText(dynamic programme) {
    if (programme == null) return 'Programme non défini';

    final nom = _safeString(programme['nom']);
    final licence = programme['licence'];
    final semestre = programme['semestre'];

    return '$nom - L$licence S$semestre';
  }

  String _getStatutText(dynamic statut) {
    switch (statut?.toString()) {
      case 'actif':
        return 'Compte actif';
      case 'en_attente':
        return 'En attente de validation';
      case 'suspendu':
        return 'Compte suspendu';
      default:
        return 'Statut inconnu';
    }
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Container(
      margin: EdgeInsets.only(bottom: AppSizes.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.etudiant.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              icon,
              color: AppColors.etudiant,
              size: 20,
            ),
          ),
          SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTextStyles.labelMedium,
                ),
                SizedBox(height: 4),
                Text(
                  value,
                  style: AppTextStyles.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPresencesSection(List<Map<String, dynamic>> presences) {
    return Container(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        ),
        child: Container(
          padding: EdgeInsets.all(AppSizes.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.history, color: AppColors.etudiant),
                  SizedBox(width: AppSizes.sm),
                  Text(
                    'Dernières Présences',
                    style: AppTextStyles.headingSmall,
                  ),
                ],
              ),
              SizedBox(height: AppSizes.lg),
              if (presences.isEmpty)
                Container(
                  padding: EdgeInsets.all(AppSizes.lg),
                  decoration: BoxDecoration(
                    color: AppColors.gray50,
                    borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, color: AppColors.gray400),
                      SizedBox(width: AppSizes.sm),
                      Text(
                        'Aucune présence enregistrée',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.gray600,
                        ),
                      ),
                    ],
                  ),
                )
              else
                ...presences
                    .take(5)
                    .map((presence) => _buildPresenceItem(presence))
                    .toList(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPresenceItem(Map<String, dynamic> presence) {
    return Container(
      margin: EdgeInsets.only(bottom: AppSizes.sm),
      padding: EdgeInsets.all(AppSizes.md),
      decoration: BoxDecoration(
        color: AppColors.gray50,
        borderRadius: BorderRadius.circular(AppSizes.radiusSm),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: AppColors.success,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          SizedBox(width: AppSizes.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  presence['cours_id']?['nom'] ?? 'Cours non défini',
                  style: AppTextStyles.labelMedium,
                ),
                Text(
                  _formatDate(presence['createdAt']),
                  style: AppTextStyles.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'Date inconnue';
    try {
      final DateTime parsedDate = DateTime.parse(date.toString());
      return '${parsedDate.day}/${parsedDate.month}/${parsedDate.year}';
    } catch (e) {
      return 'Date invalide';
    }
  }

  Widget _buildPaiementRow(int pourcentagePaye, int seuilRequis) {
    final Color statusColor =
        _getPaiementStatusColor(pourcentagePaye, seuilRequis);
    final String statusText =
        _getPaiementStatusText(pourcentagePaye, seuilRequis);

    return Container(
      margin: EdgeInsets.only(bottom: AppSizes.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              Icons.payment,
              color: statusColor,
              size: 20,
            ),
          ),
          SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Statut Paiement',
                  style: AppTextStyles.labelMedium,
                ),
                SizedBox(height: 4),
                Row(
                  children: [
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
                        '$pourcentagePaye%',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    SizedBox(width: AppSizes.sm),
                    Text(
                      statusText,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 4),
                Text(
                  'Seuil requis: $seuilRequis%',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.gray600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getPaiementStatusColor(int pourcentage, int seuil) {
    if (pourcentage >= seuil) return AppColors.success;
    if (pourcentage >= (seuil * 0.7)) return AppColors.warning;
    return AppColors.danger;
  }

  String _getPaiementStatusText(int pourcentage, int seuil) {
    if (pourcentage >= seuil) return 'Accès autorisé';
    if (pourcentage >= (seuil * 0.7)) return 'Presque atteint';
    return 'Accès restreint';
  }
}
