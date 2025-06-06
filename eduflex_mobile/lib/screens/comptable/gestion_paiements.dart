import 'package:flutter/material.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';
import '../../models/etudiant.dart';

class GestionPaiements extends StatefulWidget {
  @override
  _GestionPaiementsState createState() => _GestionPaiementsState();
}

class _GestionPaiementsState extends State<GestionPaiements> {
  final ApiService _apiService = ApiService();
  List<Etudiant> _etudiants = [];
  List<Etudiant> _etudiantsFiltres = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadEtudiants();
  }

  Future<void> _loadEtudiants() async {
    setState(() => _isLoading = true);

    try {
      final etudiantsData = await _apiService.getEtudiants();

      final etudiants =
          etudiantsData.map((data) => Etudiant.fromJson(data)).toList();

      setState(() {
        _etudiants = etudiants;
        _etudiantsFiltres = etudiants;
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

  void _filtrerEtudiants(String query) {
    setState(() {
      _searchQuery = query;
      if (query.isEmpty) {
        _etudiantsFiltres = _etudiants;
      } else {
        _etudiantsFiltres = _etudiants.where((etudiant) {
          return etudiant.nom.toLowerCase().contains(query.toLowerCase()) ||
              etudiant.prenom.toLowerCase().contains(query.toLowerCase()) ||
              etudiant.matricule.toLowerCase().contains(query.toLowerCase());
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Barre de recherche
        Container(
          margin: EdgeInsets.all(AppSizes.lg),
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
          child: TextField(
            controller: _searchController,
            onChanged: _filtrerEtudiants,
            decoration: InputDecoration(
              hintText: 'Rechercher un étudiant...',
              prefixIcon: Icon(Icons.search_rounded, color: AppColors.gray400),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: Icon(Icons.clear_rounded, color: AppColors.gray400),
                      onPressed: () {
                        _searchController.clear();
                        _filtrerEtudiants('');
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: EdgeInsets.all(AppSizes.md),
            ),
          ),
        ),

        // Liste des étudiants
        Expanded(
          child: _isLoading
              ? Center(child: CircularProgressIndicator())
              : _etudiantsFiltres.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.search_off_rounded,
                            size: 64,
                            color: AppColors.gray400,
                          ),
                          SizedBox(height: AppSizes.md),
                          Text(
                            _searchQuery.isEmpty
                                ? 'Aucun étudiant trouvé'
                                : 'Aucun résultat pour "$_searchQuery"',
                            style: AppTextStyles.bodyMedium,
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadEtudiants,
                      child: ListView.builder(
                        padding: EdgeInsets.symmetric(horizontal: AppSizes.lg),
                        itemCount: _etudiantsFiltres.length,
                        itemBuilder: (context, index) {
                          final etudiant = _etudiantsFiltres[index];
                          return _buildEtudiantCard(etudiant);
                        },
                      ),
                    ),
        ),
      ],
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
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        border: Border.all(color: AppColors.gray200),
        boxShadow: [
          BoxShadow(
            color: AppColors.gray100,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showPaiementDialog(etudiant),
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          child: Padding(
            padding: EdgeInsets.all(AppSizes.md),
            child: Column(
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: AppColors.primary100,
                      child: Text(
                        '${etudiant.prenom[0]}${etudiant.nom[0]}',
                        style: AppTextStyles.labelMedium.copyWith(
                          color: AppColors.primary700,
                          fontSize: AppSizes.fontLg,
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
                            style: AppTextStyles.headingSmall.copyWith(
                              fontSize: AppSizes.fontLg,
                            ),
                          ),
                          SizedBox(height: AppSizes.xs),
                          Text(
                            'Matricule: ${etudiant.matricule}',
                            style: AppTextStyles.bodyMedium,
                          ),
                          Text(
                            'Groupe: ${etudiant.groupe}',
                            style: AppTextStyles.bodySmall,
                          ),
                          if (etudiant.programme != null)
                            Text(
                              '${etudiant.programme!.nom} - ${etudiant.programme!.licence} S${etudiant.programme!.semestre}',
                              style: AppTextStyles.bodySmall,
                            ),
                        ],
                      ),
                    ),
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
                          child: Text(
                            statusText,
                            style: AppTextStyles.labelMedium.copyWith(
                              color: statusColor,
                            ),
                          ),
                        ),
                        SizedBox(height: AppSizes.sm),
                        Icon(
                          Icons.payment_rounded,
                          color: AppColors.primary500,
                          size: 24,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showPaiementDialog(Etudiant etudiant) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return PaiementDialog(
          etudiant: etudiant,
          onPaiementEnregistre: () {
            _loadEtudiants(); // Recharger la liste
          },
        );
      },
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

class PaiementDialog extends StatefulWidget {
  final Etudiant etudiant;
  final VoidCallback onPaiementEnregistre;

  const PaiementDialog({
    Key? key,
    required this.etudiant,
    required this.onPaiementEnregistre,
  }) : super(key: key);

  @override
  _PaiementDialogState createState() => _PaiementDialogState();
}

class _PaiementDialogState extends State<PaiementDialog> {
  final _formKey = GlobalKey<FormState>();
  final _montantController = TextEditingController();
  final _motifController = TextEditingController();
  final ApiService _apiService = ApiService();

  String _typePaiement = 'inscription';
  bool _isLoading = false;

  final List<Map<String, String>> _typesPaiement = [
    {'value': 'inscription', 'label': 'Inscription'},
    {'value': 'scolarite', 'label': 'Scolarité'},
    {'value': 'rattrapage', 'label': 'Rattrapage'},
    {'value': 'autre', 'label': 'Autre'},
  ];

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        constraints: BoxConstraints(maxWidth: 400),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      gradient: AppColors.comptableGradient,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Icon(
                      Icons.payment_rounded,
                      color: AppColors.white,
                      size: 24,
                    ),
                  ),
                  SizedBox(width: AppSizes.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Nouveau Paiement',
                          style: AppTextStyles.headingSmall,
                        ),
                        Text(
                          '${widget.etudiant.prenom} ${widget.etudiant.nom}',
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

              // Type de paiement
              Text(
                'Type de paiement',
                style: AppTextStyles.labelMedium,
              ),
              SizedBox(height: AppSizes.sm),
              Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(horizontal: AppSizes.md),
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.gray300),
                  borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _typePaiement,
                    isExpanded: true,
                    onChanged: (String? newValue) {
                      setState(() {
                        _typePaiement = newValue!;
                      });
                    },
                    items: _typesPaiement.map<DropdownMenuItem<String>>((type) {
                      return DropdownMenuItem<String>(
                        value: type['value'],
                        child: Text(type['label']!),
                      );
                    }).toList(),
                  ),
                ),
              ),

              SizedBox(height: AppSizes.md),

              // Montant
              Text(
                'Montant (FCFA)',
                style: AppTextStyles.labelMedium,
              ),
              SizedBox(height: AppSizes.sm),
              TextFormField(
                controller: _montantController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Ex: 50000',
                  prefixText: 'FCFA ',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Veuillez entrer un montant';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Montant invalide';
                  }
                  if (double.parse(value) <= 0) {
                    return 'Le montant doit être positif';
                  }
                  return null;
                },
              ),

              SizedBox(height: AppSizes.md),

              // Motif (optionnel)
              Text(
                'Motif (optionnel)',
                style: AppTextStyles.labelMedium,
              ),
              SizedBox(height: AppSizes.sm),
              TextFormField(
                controller: _motifController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Précisez le motif du paiement...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                  ),
                ),
              ),

              SizedBox(height: AppSizes.lg),

              // Boutons
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: Text('Annuler'),
                    ),
                  ),
                  SizedBox(width: AppSizes.md),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _enregistrerPaiement,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary500,
                        foregroundColor: AppColors.white,
                        padding: EdgeInsets.symmetric(vertical: AppSizes.md),
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(AppSizes.radiusMd),
                        ),
                      ),
                      child: _isLoading
                          ? SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  AppColors.white,
                                ),
                              ),
                            )
                          : Text('Enregistrer'),
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

  Future<void> _enregistrerPaiement() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await _apiService.enregistrerPaiement(
        etudiantId: widget.etudiant.id,
        montant: double.parse(_montantController.text),
        typePaiement: _typePaiement,
        motif: _motifController.text.isNotEmpty ? _motifController.text : null,
      );

      Navigator.of(context).pop();
      widget.onPaiementEnregistre();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Paiement enregistré avec succès'),
          backgroundColor: AppColors.success,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur: ${e.toString()}'),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _montantController.dispose();
    _motifController.dispose();
    super.dispose();
  }
}
