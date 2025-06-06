import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';

class DemandePresenceScreen extends StatefulWidget {
  @override
  _DemandePresenceScreenState createState() => _DemandePresenceScreenState();
}

class _DemandePresenceScreenState extends State<DemandePresenceScreen> {
  final _formKey = GlobalKey<FormState>();
  final _justificationController = TextEditingController();
  
  Map<String, dynamic>? emploiDuTemps;
  bool isLoadingSchedule = true;
  bool isSubmitting = false;
  String? selectedCours;
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
        isLoadingSchedule = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoadingSchedule = false;
      });
    }
  }

  // ✅ NOUVELLE FONCTION: Vérifier si un cours est dans la période de présence
  bool _estDansPeriodePresence(Map<String, dynamic> cours) {
    try {
      final now = DateTime.now();
      final jourActuel = _getJourFrancais(now.weekday);
      
      // Vérifier si c'est le bon jour
      if (cours['jour']?.toLowerCase() != jourActuel.toLowerCase()) {
        return false;
      }

      // Parser l'heure de fin du cours
      final creneau = cours['creneau'] as String? ?? '';
      final heures = creneau.split(' - ');
      
      if (heures.length != 2) return false;
      
      final heureFin = _parseHeure(heures[1]);
      final heureDebutPresence = heureFin.subtract(Duration(minutes: 45));
      
      // Vérifier si on est dans la période de présence (45 dernières minutes)
      return now.isAfter(heureDebutPresence) && now.isBefore(heureFin.add(Duration(minutes: 5)));
      
    } catch (e) {
      print('Erreur calcul période présence: $e');
      return false;
    }
  }

  String _getJourFrancais(int weekday) {
    const jours = [
      'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'
    ];
    return jours[weekday - 1];
  }

  DateTime _parseHeure(String heure) {
    try {
      // Format: "15h00" ou "15:00"
      final cleanHeure = heure.replaceAll('h', ':');
      final parts = cleanHeure.split(':');
      
      final now = DateTime.now();
      return DateTime(
        now.year,
        now.month,
        now.day,
        int.parse(parts[0]),
        parts.length > 1 ? int.parse(parts[1]) : 0,
      );
    } catch (e) {
      print('Erreur parsing heure: $e');
      return DateTime.now();
    }
  }

  // ✅ NOUVELLE FONCTION: Obtenir les cours disponibles pour présence
  List<Map<String, dynamic>> _getCoursDisponibles() {
    if (emploiDuTemps == null) return [];
    
    final tousCours = List<Map<String, dynamic>>.from(
      emploiDuTemps!['emploi_du_temps'] ?? []
    );
    
    return tousCours.where((cours) => _estDansPeriodePresence(cours)).toList();
  }

  String _getTempsRestant(Map<String, dynamic> cours) {
    try {
      final creneau = cours['creneau'] as String? ?? '';
      final heures = creneau.split(' - ');
      
      if (heures.length != 2) return '';
      
      final heureFin = _parseHeure(heures[1]);
      final maintenant = DateTime.now();
      
      if (heureFin.isAfter(maintenant)) {
        final difference = heureFin.difference(maintenant);
        final minutes = difference.inMinutes;
        
        if (minutes < 60) {
          return 'Se termine dans ${minutes}min';
        } else {
          final heures = difference.inHours;
          final minutesRestantes = minutes % 60;
          return 'Se termine dans ${heures}h${minutesRestantes.toString().padLeft(2, '0')}';
        }
      } else {
        return 'Cours terminé';
      }
    } catch (e) {
      return '';
    }
  }

  _envoyerDemande() async {
    if (!_formKey.currentState!.validate() || selectedCours == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Veuillez sélectionner un cours'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() {
      isSubmitting = true;
    });

    try {
      final coursInfo = emploiDuTemps!['emploi_du_temps']
          .firstWhere((c) => c['_id'] == selectedCours);
      
      final apiService = ApiService();
      await apiService.envoyerDemandePresence(
        coursId: coursInfo['cours_id']['_id'],
        emploiDuTempsId: selectedCours!,
        dateCours: DateTime.now().toIso8601String(),
        justification: _justificationController.text.trim(),
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Présence déclarée avec succès !'),
          backgroundColor: AppColors.success,
        ),
      );

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur: ${e.toString()}'),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      setState(() {
        isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Déclaration de Présence'),
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
        child: isLoadingSchedule
            ? Center(child: CircularProgressIndicator(color: AppColors.white))
            : error != null
                ? _buildError()
                : _buildForm(),
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
              Text(error!, style: AppTextStyles.bodySmall, textAlign: TextAlign.center),
              SizedBox(height: AppSizes.md),
              ElevatedButton(
                onPressed: _loadEmploiDuTemps,
                child: Text('Réessayer'),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.etudiant),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildForm() {
    final coursDisponibles = _getCoursDisponibles(); // ✅ FILTRAGE TEMPOREL

    return SingleChildScrollView(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            _buildInfoCard(),
            SizedBox(height: AppSizes.lg),
            _buildTimeInfoCard(), // ✅ NOUVELLE CARTE INFO TEMPORELLE
            SizedBox(height: AppSizes.lg),
            _buildCoursSelection(coursDisponibles),
            if (selectedCours != null) ...[
              SizedBox(height: AppSizes.lg),
              _buildJustificationField(),
              SizedBox(height: AppSizes.xl),
              _buildSubmitButton(),
            ],
          ],
        ),
      ),
    );
  }

  // ✅ NOUVELLE CARTE: Information temporelle
  Widget _buildTimeInfoCard() {
    final now = DateTime.now();
    // ✅ CORRECTION: Format simple sans locale
    final timeString = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        child: Row(
          children: [
            Icon(Icons.access_time, color: AppColors.warning, size: 32),
            SizedBox(width: AppSizes.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Heure actuelle: $timeString', // ✅ CORRECTION
                    style: AppTextStyles.headingSmall,
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Vous pouvez déclarer votre présence uniquement durant les 45 dernières minutes de chaque cours.',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.gray600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        child: Column(
          children: [
            Icon(Icons.check_circle, color: AppColors.success, size: 40),
            SizedBox(height: AppSizes.md),
            Text(
              'Déclaration de Présence',
              style: AppTextStyles.headingSmall,
            ),
            SizedBox(height: AppSizes.sm),
            Text(
              'Sélectionnez le cours actuel pour déclarer votre présence. Vous devez avoir scanné votre QR code à l\'entrée aujourd\'hui.',
              style: AppTextStyles.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCoursSelection(List<Map<String, dynamic>> coursDisponibles) {
    if (coursDisponibles.isEmpty) {
      return Card(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        ),
        child: Container(
          padding: EdgeInsets.all(AppSizes.lg),
          child: Column(
            children: [
              Icon(Icons.schedule_outlined, color: AppColors.gray400, size: 48),
              SizedBox(height: AppSizes.md),
              Text(
                'Aucun cours disponible',
                style: AppTextStyles.headingSmall,
              ),
              SizedBox(height: AppSizes.sm),
              Text(
                'Vous ne pouvez déclarer votre présence que durant les 45 dernières minutes de vos cours.',
                style: AppTextStyles.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return Card(
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
              'Cours disponibles (${coursDisponibles.length})',
              style: AppTextStyles.headingSmall,
            ),
            SizedBox(height: AppSizes.md),
            ...coursDisponibles.map((cours) => _buildCoursOption(cours)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildCoursOption(Map<String, dynamic> cours) {
    final isSelected = selectedCours == cours['_id'];
    final tempsRestant = _getTempsRestant(cours);
    
    return Container(
      margin: EdgeInsets.only(bottom: AppSizes.sm),
      child: Card(
        elevation: isSelected ? 4 : 1,
        color: isSelected ? AppColors.etudiant.withOpacity(0.1) : null,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusMd),
          side: BorderSide(
            color: isSelected ? AppColors.etudiant : AppColors.gray300,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: InkWell(
          onTap: () {
            setState(() {
              selectedCours = cours['_id'];
            });
          },
          borderRadius: BorderRadius.circular(AppSizes.radiusMd),
          child: Container(
            padding: EdgeInsets.all(AppSizes.md),
            child: Row(
              children: [
                Radio<String>(
                  value: cours['_id'],
                  groupValue: selectedCours,
                  onChanged: (value) {
                    setState(() {
                      selectedCours = value;
                    });
                  },
                  activeColor: AppColors.etudiant,
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        cours['cours_id']['nom'] ?? 'Cours',
                        style: AppTextStyles.headingSmall.copyWith(
                          color: isSelected ? AppColors.etudiant : null,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        '${cours['professeur_id']['nom_complet'] ?? 'Professeur'} • ${cours['salle_id']['nom'] ?? 'Salle'}',
                        style: AppTextStyles.bodySmall,
                      ),
                      Text(
                        '${cours['creneau']} • $tempsRestant',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.warning,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.timer,
                  color: AppColors.warning,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildJustificationField() {
    return Card(
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
              'Commentaire (optionnel)',
              style: AppTextStyles.headingSmall,
            ),
            SizedBox(height: AppSizes.md),
            TextFormField(
              controller: _justificationController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Ajouter un commentaire...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                  borderSide: BorderSide(color: AppColors.etudiant),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return Container(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isSubmitting ? null : _envoyerDemande,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.etudiant,
          foregroundColor: AppColors.white,
          padding: EdgeInsets.symmetric(vertical: AppSizes.md),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          elevation: 4,
        ),
        child: isSubmitting
            ? Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: AppColors.white,
                      strokeWidth: 2,
                    ),
                  ),
                  SizedBox(width: AppSizes.sm),
                  Text('Envoi en cours...'),
                ],
              )
            : Text(
                'Confirmer ma présence',
                style: AppTextStyles.headingSmall.copyWith(
                  color: AppColors.white,
                ),
              ),
      ),
    );
  }
}