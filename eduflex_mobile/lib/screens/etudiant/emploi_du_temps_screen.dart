import 'package:flutter/material.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';

class EmploiDuTempsScreen extends StatefulWidget {
  @override
  _EmploiDuTempsScreenState createState() => _EmploiDuTempsScreenState();
}

class _EmploiDuTempsScreenState extends State<EmploiDuTempsScreen> {
  Map<String, dynamic>? emploiDuTemps;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadEmploiDuTemps();
  }

  _loadEmploiDuTemps() async {
    try {
      final apiService = ApiService();
      final data = await apiService.getEmploiDuTempsEtudiant();
      setState(() {
        emploiDuTemps = data;
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
      appBar: AppBar(
        title: Text('Mon Emploi du Temps'),
        backgroundColor: AppColors.etudiant,
        foregroundColor: AppColors.white,
        elevation: 0,
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
            ? Center(child: CircularProgressIndicator(color: AppColors.etudiant))
            : error != null
                ? _buildError()
                : _buildEmploiDuTemps(),
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
              Text(
                'Erreur de chargement',
                style: AppTextStyles.headingSmall,
              ),
              SizedBox(height: AppSizes.sm),
              Text(
                error!,
                style: AppTextStyles.bodySmall,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: AppSizes.md),
              ElevatedButton(
                onPressed: _loadEmploiDuTemps,
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

  Widget _buildEmploiDuTemps() {
    final etudiant = emploiDuTemps!['etudiant'];
    final cours = List<Map<String, dynamic>>.from(
        emploiDuTemps!['emploi_du_temps'] ?? []);

    return SingleChildScrollView(
      child: Column(
        children: [
          _buildHeader(etudiant),
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
                _buildWeekView(cours),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(Map<String, dynamic> etudiant) {
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
            children: [
              Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      gradient: AppColors.etudiantGradient,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Center(
                      child: Text('📚', style: TextStyle(fontSize: 24)),
                    ),
                  ),
                  SizedBox(width: AppSizes.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${etudiant['prenom']} ${etudiant['nom']}',
                          style: AppTextStyles.headingSmall,
                        ),
                        Text(
                          '${etudiant['programme']} - Groupe ${etudiant['groupe']}',
                          style: AppTextStyles.bodySmall,
                        ),
                      ],
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

  Widget _buildWeekView(List<Map<String, dynamic>> cours) {
    // Grouper les cours par jour
    Map<String, List<Map<String, dynamic>>> coursParJour = {};
    
    final jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    
    for (String jour in jours) {
      coursParJour[jour] = cours.where((c) => 
        c['jour']?.toString().toLowerCase() == jour).toList();
    }

    return Container(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Planning de la semaine',
            style: AppTextStyles.headingMedium,
          ),
          SizedBox(height: AppSizes.lg),
          ...jours.map((jour) => _buildJourCard(jour, coursParJour[jour] ?? [])),
        ],
      ),
    );
  }

  Widget _buildJourCard(String jour, List<Map<String, dynamic>> cours) {
    return Card(
      margin: EdgeInsets.only(bottom: AppSizes.md),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: AppSizes.md,
                vertical: AppSizes.sm,
              ),
              decoration: BoxDecoration(
                gradient: AppColors.etudiantGradient,
                borderRadius: BorderRadius.circular(AppSizes.radiusSm),
              ),
              child: Text(
                jour.toUpperCase(),
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.white,
                ),
              ),
            ),
            SizedBox(height: AppSizes.md),
            if (cours.isEmpty)
              Container(
                padding: EdgeInsets.all(AppSizes.md),
                child: Text(
                  'Aucun cours ce jour',
                  style: AppTextStyles.bodySmall,
                ),
              )
            else
              ...cours.map((c) => _buildCoursItem(c)),
          ],
        ),
      ),
    );
  }

  // ✅ FONCTION CORRIGÉE POUR AFFICHER LES VRAIS NOMS
  Widget _buildCoursItem(Map<String, dynamic> cours) {
    // Helper pour récupérer le nom complet du professeur
    String getNomProfesseur() {
      final professeur = cours['professeur_id'];
      if (professeur == null) return 'Professeur non défini';
      
      if (professeur['nom_complet'] != null) {
        return professeur['nom_complet'];
      }
      
      final prenom = professeur['prenom']?.toString() ?? '';
      final nom = professeur['nom']?.toString() ?? '';
      
      if (prenom.isNotEmpty && nom.isNotEmpty) {
        return '$prenom $nom';
      } else if (nom.isNotEmpty) {
        return nom;
      } else if (prenom.isNotEmpty) {
        return prenom;
      }
      
      return 'Professeur non défini';
    }

    // Helper pour récupérer le nom du cours
    String getNomCours() {
      return cours['cours_id']?['nom']?.toString() ?? 'Cours non défini';
    }

    // Helper pour récupérer le nom de la salle
    String getNomSalle() {
      return cours['salle_id']?['nom']?.toString() ?? 'Salle non définie';
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
            color: AppColors.etudiant,
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
                  getNomCours(), // ✅ AFFICHAGE DU VRAI NOM DU COURS
                  style: AppTextStyles.headingSmall.copyWith(fontSize: 16),
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: AppSizes.sm,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.etudiant.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                ),
                child: Text(
                  '${cours['heure_debut'] ?? ''} - ${cours['heure_fin'] ?? ''}',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.etudiant,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: AppSizes.sm),
          Row(
            children: [
              Icon(Icons.person, size: 16, color: AppColors.gray500),
              SizedBox(width: 4),
              Expanded(
                child: Text(
                  getNomProfesseur(), // ✅ AFFICHAGE DU VRAI NOM DU PROFESSEUR
                  style: AppTextStyles.bodySmall,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          SizedBox(height: 4),
          Row(
            children: [
              Icon(Icons.room, size: 16, color: AppColors.gray500),
              SizedBox(width: 4),
              Expanded(
                child: Text(
                  getNomSalle(), // ✅ AFFICHAGE DU VRAI NOM DE LA SALLE
                  style: AppTextStyles.bodySmall,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}