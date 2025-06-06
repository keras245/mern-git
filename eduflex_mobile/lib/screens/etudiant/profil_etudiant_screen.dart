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
      setState(() {
        profil = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  _logout() async {
    try {
      await AuthService().logout();
      Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la déconnexion'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  String _safeString(dynamic value) {
    if (value == null) return 'N/A';
    return value.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Mon Profil'),
        backgroundColor: AppColors.etudiant,
        foregroundColor: AppColors.white,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _logout,
            icon: Icon(Icons.logout),
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
            ? Center(child: CircularProgressIndicator(color: AppColors.white))
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
              Text(error!,
                  style: AppTextStyles.bodySmall, textAlign: TextAlign.center),
              SizedBox(height: AppSizes.md),
              ElevatedButton(
                onPressed: _loadProfil,
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
                      Icon(Icons.info, color: AppColors.gray500),
                      SizedBox(width: AppSizes.sm),
                      Text(
                        'Aucune présence enregistrée',
                        style: AppTextStyles.bodyMedium,
                      ),
                    ],
                  ),
                )
              else
                ...presences
                    .take(5)
                    .map((presence) => _buildPresenceItem(presence)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPresenceItem(Map<String, dynamic> presence) {
    Color statusColor;
    IconData statusIcon;
    String statusText;

    final statut = _safeString(presence['statut']).toLowerCase();

    switch (statut) {
      case 'confirmé':
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle;
        statusText = 'Confirmé';
        break;
      case 'en_attente':
        statusColor = AppColors.warning;
        statusIcon = Icons.schedule;
        statusText = 'En attente';
        break;
      case 'refusé':
        statusColor = AppColors.danger;
        statusIcon = Icons.cancel;
        statusText = 'Refusé';
        break;
      default:
        statusColor = AppColors.gray500;
        statusIcon = Icons.help;
        statusText = 'Inconnu';
    }

    return Container(
      margin: EdgeInsets.only(bottom: AppSizes.sm),
      padding: EdgeInsets.all(AppSizes.md),
      decoration: BoxDecoration(
        color: AppColors.gray50,
        borderRadius: BorderRadius.circular(AppSizes.radiusSm),
        border: Border(
          left: BorderSide(
            width: 4,
            color: statusColor,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  _safeString(presence['cours_id']?['nom']),
                  style: AppTextStyles.labelMedium,
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: AppSizes.sm,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(statusIcon, size: 14, color: statusColor),
                    SizedBox(width: 4),
                    Text(
                      statusText,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: AppSizes.sm),
          Text(
            '${_safeString(presence['jour'])} - ${_safeString(presence['creneau'])}',
            style: AppTextStyles.bodySmall,
          ),
          if (presence['remarques'] != null &&
              presence['remarques'].toString().isNotEmpty)
            Padding(
              padding: EdgeInsets.only(top: AppSizes.sm),
              child: Text(
                'Note: ${_safeString(presence['remarques'])}',
                style: AppTextStyles.bodySmall.copyWith(
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _getStatutText(dynamic statut) {
    final statutStr = _safeString(statut).toLowerCase();
    switch (statutStr) {
      case 'validé':
        return 'Compte validé ✅';
      case 'en_attente':
        return 'En attente de validation ⏳';
      case 'suspendu':
        return 'Compte suspendu ❌';
      default:
        return 'Statut inconnu ❓';
    }
  }
}
