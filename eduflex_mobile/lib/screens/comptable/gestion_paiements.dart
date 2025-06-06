import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';

class GestionPaiements extends StatefulWidget {
  @override
  _GestionPaiementsState createState() => _GestionPaiementsState();
}

class _GestionPaiementsState extends State<GestionPaiements> {
  final _matriculeController = TextEditingController();
  final _pourcentageController = TextEditingController();
  final _seuilController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  Map<String, dynamic>? etudiantData;
  bool isLoading = false;
  bool isSearching = false;
  bool isUpdating = false;
  String? error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.comptable.withOpacity(0.1),
              AppColors.white,
            ],
            stops: [0.0, 0.3],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(AppSizes.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                SizedBox(height: AppSizes.xl),
                _buildSearchSection(),
                if (etudiantData != null) ...[
                  SizedBox(height: AppSizes.xl),
                  _buildEtudiantInfo(),
                  SizedBox(height: AppSizes.xl),
                  _buildPaiementForm(),
                ],
                SizedBox(height: AppSizes.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.all(AppSizes.lg),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.comptable, AppColors.comptable.withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
        boxShadow: [
          BoxShadow(
            color: AppColors.comptable.withOpacity(0.3),
            blurRadius: 15,
            offset: Offset(0, 5),
          ),
        ],
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
            child: Center(
              child: Text('💳', style: TextStyle(fontSize: 30)),
            ),
          ),
          SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Gestion des Paiements',
                  style: AppTextStyles.headingMedium.copyWith(
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Mise à jour des paiements étudiants',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.white.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.payment_rounded,
            color: AppColors.white,
            size: 32,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchSection() {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.search_rounded,
                    color: AppColors.comptable, size: 28),
                SizedBox(width: AppSizes.sm),
                Text(
                  'Rechercher un Étudiant',
                  style: AppTextStyles.headingSmall.copyWith(
                    color: AppColors.comptable,
                  ),
                ),
              ],
            ),
            SizedBox(height: AppSizes.lg),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _matriculeController,
                    decoration: InputDecoration(
                      labelText: 'Matricule de l\'étudiant',
                      hintText: 'Ex: 2100240',
                      prefixIcon:
                          Icon(Icons.badge_rounded, color: AppColors.comptable),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                        borderSide: BorderSide(color: AppColors.gray300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                        borderSide:
                            BorderSide(color: AppColors.comptable, width: 2),
                      ),
                      filled: true,
                      fillColor: AppColors.gray50,
                    ),
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  ),
                ),
                SizedBox(width: AppSizes.md),
                Container(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: isSearching ? null : _rechercherEtudiant,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.comptable,
                      foregroundColor: AppColors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                      ),
                      padding: EdgeInsets.symmetric(horizontal: AppSizes.lg),
                      elevation: 4,
                    ),
                    child: isSearching
                        ? SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: AppColors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Icon(Icons.search_rounded, size: 24),
                  ),
                ),
              ],
            ),
            if (error != null) ...[
              SizedBox(height: AppSizes.md),
              Container(
                padding: EdgeInsets.all(AppSizes.md),
                decoration: BoxDecoration(
                  color: AppColors.danger.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                  border: Border.all(color: AppColors.danger.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline,
                        color: AppColors.danger, size: 20),
                    SizedBox(width: AppSizes.sm),
                    Expanded(
                      child: Text(
                        error!,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.danger,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEtudiantInfo() {
    final etudiant = etudiantData!;
    final programme = etudiant['programme_id'];

    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppColors.success,
                        AppColors.success.withOpacity(0.7)
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(40),
                  ),
                  child: Center(
                    child: Text(
                      '${etudiant['prenom']?[0] ?? ''}${etudiant['nom']?[0] ?? ''}',
                      style: AppTextStyles.headingMedium.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                SizedBox(width: AppSizes.lg),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${etudiant['prenom']} ${etudiant['nom']}',
                        style: AppTextStyles.headingMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 4),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: AppSizes.sm,
                          vertical: AppSizes.xs,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.comptable.withOpacity(0.1),
                          borderRadius:
                              BorderRadius.circular(AppSizes.radiusSm),
                        ),
                        child: Text(
                          'Matricule: ${etudiant['matricule']}',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.comptable,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.all(AppSizes.sm),
                  decoration: BoxDecoration(
                    color: _getPaiementStatusColor(
                            etudiant['pourcentage_paiement'] ?? 0)
                        .withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                  ),
                  child: Column(
                    children: [
                      Text(
                        '${etudiant['pourcentage_paiement'] ?? 0}%',
                        style: AppTextStyles.headingSmall.copyWith(
                          color: _getPaiementStatusColor(
                              etudiant['pourcentage_paiement'] ?? 0),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Payé',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: _getPaiementStatusColor(
                              etudiant['pourcentage_paiement'] ?? 0),
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
                color: AppColors.gray50,
                borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              ),
              child: Column(
                children: [
                  _buildInfoRow(
                      Icons.school_rounded,
                      'Programme',
                      programme != null
                          ? '${programme['nom']} - L${programme['licence']} S${programme['semestre']}'
                          : 'Non défini'),
                  _buildInfoRow(Icons.group_rounded, 'Groupe',
                      '${etudiant['groupe'] ?? 'Non défini'}'),
                  _buildInfoRow(Icons.email_rounded, 'Email',
                      '${etudiant['email'] ?? 'Non défini'}'),
                  _buildInfoRow(Icons.phone_rounded, 'Téléphone',
                      '${etudiant['telephone'] ?? 'Non défini'}'),
                  _buildInfoRow(Icons.percent_rounded, 'Seuil d\'accès requis',
                      '${etudiant['pourcentage_paiement_seuil'] ?? 75}%'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: AppSizes.sm),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.comptable.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: AppColors.comptable, size: 16),
          ),
          SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.gray600,
                  ),
                ),
                Text(
                  value,
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaiementForm() {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.edit_rounded,
                      color: AppColors.comptable, size: 28),
                  SizedBox(width: AppSizes.sm),
                  Text(
                    'Mise à Jour du Paiement',
                    style: AppTextStyles.headingSmall.copyWith(
                      color: AppColors.comptable,
                    ),
                  ),
                ],
              ),
              SizedBox(height: AppSizes.lg),

              // Pourcentage payé
              TextFormField(
                controller: _pourcentageController,
                decoration: InputDecoration(
                  labelText: 'Pourcentage payé (%)',
                  hintText: 'Ex: 85',
                  prefixIcon:
                      Icon(Icons.percent_rounded, color: AppColors.comptable),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                    borderSide:
                        BorderSide(color: AppColors.comptable, width: 2),
                  ),
                  filled: true,
                  fillColor: AppColors.gray50,
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(3),
                ],
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Veuillez entrer un pourcentage';
                  }
                  final pourcentage = int.tryParse(value);
                  if (pourcentage == null ||
                      pourcentage < 0 ||
                      pourcentage > 100) {
                    return 'Le pourcentage doit être entre 0 et 100';
                  }
                  return null;
                },
              ),
              SizedBox(height: AppSizes.lg),

              // Seuil minimum pour l'accès
              TextFormField(
                controller: _seuilController,
                decoration: InputDecoration(
                  labelText: 'Seuil minimum pour l\'accès (%)',
                  hintText: 'Ex: 75',
                  prefixIcon:
                      Icon(Icons.security_rounded, color: AppColors.comptable),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                    borderSide:
                        BorderSide(color: AppColors.comptable, width: 2),
                  ),
                  filled: true,
                  fillColor: AppColors.gray50,
                  helperText:
                      'Pourcentage minimum requis pour accéder à la salle',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(3),
                ],
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Veuillez entrer un seuil';
                  }
                  final seuil = int.tryParse(value);
                  if (seuil == null || seuil < 0 || seuil > 100) {
                    return 'Le seuil doit être entre 0 et 100';
                  }
                  return null;
                },
              ),
              SizedBox(height: AppSizes.xl),

              // Bouton de mise à jour
              Container(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: isUpdating ? null : _mettreAJourPaiement,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.comptable,
                    foregroundColor: AppColors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                    ),
                    elevation: 4,
                  ),
                  child: isUpdating
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
                            Text('Mise à jour en cours...'),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.save_rounded, size: 24),
                            SizedBox(width: AppSizes.sm),
                            Text(
                              'Mettre à Jour le Paiement',
                              style: AppTextStyles.headingSmall.copyWith(
                                color: AppColors.white,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getPaiementStatusColor(int pourcentage) {
    if (pourcentage >= 75) return AppColors.success;
    if (pourcentage >= 50) return AppColors.warning;
    return AppColors.danger;
  }

  Future<void> _rechercherEtudiant() async {
    if (_matriculeController.text.trim().isEmpty) {
      setState(() {
        error = 'Veuillez entrer un matricule';
      });
      return;
    }

    setState(() {
      isSearching = true;
      error = null;
      etudiantData = null;
    });

    try {
      final apiService = ApiService();

      // Rechercher l'étudiant par matricule
      final response = await apiService
          .rechercherEtudiantParMatricule(_matriculeController.text.trim());

      setState(() {
        etudiantData = response;
        isSearching = false;

        // Pré-remplir les champs avec les valeurs actuelles
        _pourcentageController.text =
            '${response['pourcentage_paiement'] ?? 0}';
        _seuilController.text =
            '${response['pourcentage_paiement_seuil'] ?? 75}';
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isSearching = false;
        etudiantData = null;
      });
    }
  }

  Future<void> _mettreAJourPaiement() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      isUpdating = true;
    });

    try {
      final apiService = ApiService();

      await apiService.mettreAJourPaiementEtudiant(
        etudiantId: etudiantData!['_id'],
        pourcentagePaiement: int.parse(_pourcentageController.text),
        seuilAcces: int.parse(_seuilController.text),
      );

      // Actualiser les données de l'étudiant
      await _rechercherEtudiant();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.check_circle, color: AppColors.white),
              SizedBox(width: AppSizes.sm),
              Text('Paiement mis à jour avec succès !'),
            ],
          ),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusMd),
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.error, color: AppColors.white),
              SizedBox(width: AppSizes.sm),
              Expanded(child: Text('Erreur: ${e.toString()}')),
            ],
          ),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusMd),
          ),
        ),
      );
    } finally {
      setState(() {
        isUpdating = false;
      });
    }
  }

  @override
  void dispose() {
    _matriculeController.dispose();
    _pourcentageController.dispose();
    _seuilController.dispose();
    super.dispose();
  }
}
