import 'package:flutter/material.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';
import '../../models/etudiant.dart';

class RechercheEtudiant extends StatefulWidget {
  @override
  _RechercheEtudiantState createState() => _RechercheEtudiantState();
}

class _RechercheEtudiantState extends State<RechercheEtudiant> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();

  List<Etudiant> _etudiants = [];
  List<Etudiant> _etudiantsFiltres = [];
  bool _isLoading = false;
  bool _hasSearched = false;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadAllEtudiants();
  }

  Future<void> _loadAllEtudiants() async {
    setState(() => _isLoading = true);

    try {
      final etudiantsData = await _apiService.getEtudiants();
      final etudiants =
          etudiantsData.map((data) => Etudiant.fromJson(data)).toList();
      setState(() {
        _etudiants = etudiants;
        _etudiantsFiltres = [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors du chargement: ${e.toString()}'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  void _rechercherEtudiants(String query) {
    setState(() {
      _searchQuery = query;
      _hasSearched = query.isNotEmpty;

      if (query.isEmpty) {
        _etudiantsFiltres = [];
      } else {
        _etudiantsFiltres = _etudiants.where((etudiant) {
          return etudiant.nom.toLowerCase().contains(query.toLowerCase()) ||
              etudiant.prenom.toLowerCase().contains(query.toLowerCase()) ||
              etudiant.matricule.toLowerCase().contains(query.toLowerCase()) ||
              etudiant.email.toLowerCase().contains(query.toLowerCase());
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header avec titre
          Text(
            'Recherche d\'Étudiants',
            style: AppTextStyles.headingMedium,
          ),
          SizedBox(height: AppSizes.sm),
          Text(
            'Trouvez rapidement un étudiant par nom, prénom, matricule ou email',
            style: AppTextStyles.bodyMedium,
          ),

          SizedBox(height: AppSizes.lg),

          // Barre de recherche améliorée
          Container(
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(AppSizes.radiusXl),
              border: Border.all(color: AppColors.primary200),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary100.withOpacity(0.5),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: TextField(
              controller: _searchController,
              onChanged: _rechercherEtudiants,
              decoration: InputDecoration(
                hintText: 'Tapez le nom, prénom, matricule ou email...',
                hintStyle: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.gray400,
                ),
                prefixIcon: Container(
                  padding: EdgeInsets.all(AppSizes.md),
                  child: Icon(
                    Icons.search_rounded,
                    color: AppColors.primary500,
                    size: 24,
                  ),
                ),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: Icon(
                          Icons.clear_rounded,
                          color: AppColors.gray400,
                        ),
                        onPressed: () {
                          _searchController.clear();
                          _rechercherEtudiants('');
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(
                  horizontal: AppSizes.lg,
                  vertical: AppSizes.md,
                ),
              ),
            ),
          ),

          SizedBox(height: AppSizes.lg),

          // Résultats de recherche
          Expanded(
            child: _buildSearchResults(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults() {
    if (_isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary500),
            ),
            SizedBox(height: AppSizes.md),
            Text(
              'Chargement des données...',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      );
    }

    if (!_hasSearched) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primary50,
                borderRadius: BorderRadius.circular(60),
              ),
              child: Icon(
                Icons.search_rounded,
                size: 60,
                color: AppColors.primary300,
              ),
            ),
            SizedBox(height: AppSizes.lg),
            Text(
              'Commencez votre recherche',
              style: AppTextStyles.headingSmall.copyWith(
                color: AppColors.gray600,
              ),
            ),
            SizedBox(height: AppSizes.sm),
            Text(
              'Tapez au moins 2 caractères pour rechercher un étudiant',
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    if (_etudiantsFiltres.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.gray100,
                borderRadius: BorderRadius.circular(60),
              ),
              child: Icon(
                Icons.search_off_rounded,
                size: 60,
                color: AppColors.gray400,
              ),
            ),
            SizedBox(height: AppSizes.lg),
            Text(
              'Aucun résultat trouvé',
              style: AppTextStyles.headingSmall.copyWith(
                color: AppColors.gray600,
              ),
            ),
            SizedBox(height: AppSizes.sm),
            Text(
              'Aucun étudiant ne correspond à "$_searchQuery"',
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: AppSizes.lg),
            ElevatedButton(
              onPressed: () {
                _searchController.clear();
                _rechercherEtudiants('');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary500,
                foregroundColor: AppColors.white,
              ),
              child: Text('Nouvelle recherche'),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Compteur de résultats
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: AppSizes.md,
            vertical: AppSizes.sm,
          ),
          decoration: BoxDecoration(
            color: AppColors.primary50,
            borderRadius: BorderRadius.circular(AppSizes.radiusMd),
          ),
          child: Text(
            '${_etudiantsFiltres.length} résultat(s) trouvé(s)',
            style: AppTextStyles.labelMedium.copyWith(
              color: AppColors.primary700,
            ),
          ),
        ),

        SizedBox(height: AppSizes.md),

        // Liste des résultats
        Expanded(
          child: ListView.builder(
            itemCount: _etudiantsFiltres.length,
            itemBuilder: (context, index) {
              final etudiant = _etudiantsFiltres[index];
              return _buildEtudiantCard(etudiant);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEtudiantCard(Etudiant etudiant) {
    Color statusColor;
    String statusText;
    IconData statusIcon;

    switch (etudiant.statutCompte) {
      case 'valide':
        statusColor = AppColors.success;
        statusText = 'Compte Validé';
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'en_attente':
        statusColor = AppColors.warning;
        statusText = 'En Attente';
        statusIcon = Icons.pending_rounded;
        break;
      default:
        statusColor = AppColors.danger;
        statusText = 'Suspendu';
        statusIcon = Icons.block_rounded;
    }

    return Container(
      margin: EdgeInsets.only(bottom: AppSizes.md),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
        border: Border.all(color: AppColors.gray200),
        boxShadow: [
          BoxShadow(
            color: AppColors.gray100,
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showEtudiantDetails(etudiant),
          borderRadius: BorderRadius.circular(AppSizes.radiusXl),
          child: Padding(
            padding: EdgeInsets.all(AppSizes.lg),
            child: Column(
              children: [
                Row(
                  children: [
                    // Avatar
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: Center(
                        child: Text(
                          '${etudiant.prenom[0]}${etudiant.nom[0]}',
                          style: AppTextStyles.headingSmall.copyWith(
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ),

                    SizedBox(width: AppSizes.md),

                    // Informations principales
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${etudiant.prenom} ${etudiant.nom}',
                            style: AppTextStyles.headingSmall,
                          ),
                          SizedBox(height: AppSizes.xs),
                          Row(
                            children: [
                              Icon(
                                Icons.badge_rounded,
                                size: 16,
                                color: AppColors.gray500,
                              ),
                              SizedBox(width: AppSizes.xs),
                              Text(
                                etudiant.matricule,
                                style: AppTextStyles.bodyMedium,
                              ),
                            ],
                          ),
                          SizedBox(height: AppSizes.xs),
                          Row(
                            children: [
                              Icon(
                                Icons.email_rounded,
                                size: 16,
                                color: AppColors.gray500,
                              ),
                              SizedBox(width: AppSizes.xs),
                              Expanded(
                                child: Text(
                                  etudiant.email,
                                  style: AppTextStyles.bodySmall,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Statut
                    Column(
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: AppSizes.md,
                            vertical: AppSizes.sm,
                          ),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.1),
                            borderRadius:
                                BorderRadius.circular(AppSizes.radiusMd),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                statusIcon,
                                size: 16,
                                color: statusColor,
                              ),
                              SizedBox(width: AppSizes.xs),
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
                  ],
                ),

                SizedBox(height: AppSizes.md),

                // Informations supplémentaires
                Container(
                  padding: EdgeInsets.all(AppSizes.md),
                  decoration: BoxDecoration(
                    color: AppColors.gray50,
                    borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Programme',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.gray500,
                              ),
                            ),
                            Text(
                              etudiant.programme?.nom ?? 'Non défini',
                              style: AppTextStyles.labelMedium,
                            ),
                          ],
                        ),
                      ),
                      Container(
                        width: 1,
                        height: 30,
                        color: AppColors.gray300,
                      ),
                      SizedBox(width: AppSizes.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Groupe',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.gray500,
                              ),
                            ),
                            Text(
                              'Groupe ${etudiant.groupe}',
                              style: AppTextStyles.labelMedium,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showEtudiantDetails(Etudiant etudiant) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusXl),
          ),
          child: Container(
            padding: EdgeInsets.all(AppSizes.lg),
            constraints: BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Center(
                        child: Text(
                          '${etudiant.prenom[0]}${etudiant.nom[0]}',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: AppSizes.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Détails de l\'étudiant',
                            style: AppTextStyles.headingSmall,
                          ),
                          Text(
                            '${etudiant.prenom} ${etudiant.nom}',
                            style: AppTextStyles.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(Icons.close_rounded),
                    ),
                  ],
                ),

                SizedBox(height: AppSizes.lg),

                // Informations détaillées
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(AppSizes.md),
                  decoration: BoxDecoration(
                    color: AppColors.gray50,
                    borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDetailRow('Matricule', etudiant.matricule),
                      _buildDetailRow('Email', etudiant.email),
                      _buildDetailRow('Téléphone', etudiant.telephone),
                      _buildDetailRow(
                          'Programme', etudiant.programme?.nom ?? 'Non défini'),
                      _buildDetailRow('Licence',
                          etudiant.programme?.licence ?? 'Non défini'),
                      _buildDetailRow(
                          'Semestre', 'S${etudiant.programme?.semestre ?? 0}'),
                      _buildDetailRow('Groupe', 'Groupe ${etudiant.groupe}'),
                      _buildDetailRow('Statut', etudiant.statutCompte),
                      _buildDetailRow('QR Code', etudiant.qrCode),
                    ],
                  ),
                ),

                SizedBox(height: AppSizes.lg),

                // Bouton fermer
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary500,
                      foregroundColor: AppColors.white,
                      padding: EdgeInsets.symmetric(vertical: AppSizes.md),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                      ),
                    ),
                    child: Text('Fermer'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: AppSizes.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.gray600,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodySmall,
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
