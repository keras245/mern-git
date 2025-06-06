import 'package:flutter/material.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';
import '../../models/comptable.dart';
import '../../models/vigile.dart';

class GestionUtilisateurs extends StatefulWidget {
  @override
  _GestionUtilisateursState createState() => _GestionUtilisateursState();
}

class _GestionUtilisateursState extends State<GestionUtilisateurs>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ApiService _apiService = ApiService();

  List<Comptable> _comptables = [];
  List<Vigile> _vigiles = [];
  bool _isLoadingComptables = true;
  bool _isLoadingVigiles = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadComptables(),
      _loadVigiles(),
    ]);
  }

  Future<void> _loadComptables() async {
    if (!mounted) return;

    setState(() => _isLoadingComptables = true);

    try {
      final comptablesData = await _apiService.getComptables();

      if (!mounted) return;

      final comptables =
          comptablesData.map((data) => Comptable.fromJson(data)).toList();

      setState(() {
        _comptables = comptables;
        _isLoadingComptables = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() => _isLoadingComptables = false);
      _showErrorSnackBar('Fonctionnalité en cours de développement');
    }
  }

  Future<void> _loadVigiles() async {
    if (!mounted) return;

    setState(() => _isLoadingVigiles = true);

    try {
      final vigilesData = await _apiService.getVigiles();

      if (!mounted) return;

      final vigiles = vigilesData.map((data) => Vigile.fromJson(data)).toList();

      setState(() {
        _vigiles = vigiles;
        _isLoadingVigiles = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() => _isLoadingVigiles = false);
      _showErrorSnackBar('Fonctionnalité en cours de développement');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header avec titre et bouton d'ajout
        Container(
          padding: EdgeInsets.all(AppSizes.lg),
          decoration: BoxDecoration(
            color: AppColors.white,
            boxShadow: [
              BoxShadow(
                color: AppColors.gray200.withOpacity(0.5),
                blurRadius: 8,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Gestion des Utilisateurs',
                      style: AppTextStyles.headingMedium,
                    ),
                    Text(
                      'Gérez les comptables et vigiles',
                      style: AppTextStyles.bodyMedium,
                    ),
                  ],
                ),
              ),
              FloatingActionButton(
                onPressed: _showAddUserDialog,
                backgroundColor: AppColors.primary500,
                child: Icon(Icons.add_rounded, color: AppColors.white),
                mini: true,
              ),
            ],
          ),
        ),

        // Tabs
        Container(
          color: AppColors.white,
          child: TabBar(
            controller: _tabController,
            labelColor: AppColors.primary500,
            unselectedLabelColor: AppColors.gray500,
            indicatorColor: AppColors.primary500,
            tabs: [
              Tab(
                icon: Icon(Icons.account_balance_wallet_rounded),
                text: 'Comptables (${_comptables.length})',
              ),
              Tab(
                icon: Icon(Icons.security_rounded),
                text: 'Vigiles (${_vigiles.length})',
              ),
            ],
          ),
        ),

        // Content
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              // Onglet Comptables
              RefreshIndicator(
                onRefresh: _loadComptables,
                child: _buildComptablesList(),
              ),
              // Onglet Vigiles
              RefreshIndicator(
                onRefresh: _loadVigiles,
                child: _buildVigilesList(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildComptablesList() {
    if (_isLoadingComptables) {
      return Center(child: CircularProgressIndicator());
    }

    if (_comptables.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.account_balance_wallet_outlined,
              size: 64,
              color: AppColors.gray400,
            ),
            SizedBox(height: AppSizes.md),
            Text(
              'Aucun comptable trouvé',
              style: AppTextStyles.headingSmall.copyWith(
                color: AppColors.gray600,
              ),
            ),
            SizedBox(height: AppSizes.sm),
            Text(
              'Ajoutez un comptable pour commencer',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(AppSizes.lg),
      itemCount: _comptables.length,
      itemBuilder: (context, index) {
        final comptable = _comptables[index];
        return _buildComptableCard(comptable);
      },
    );
  }

  Widget _buildVigilesList() {
    if (_isLoadingVigiles) {
      return Center(child: CircularProgressIndicator());
    }

    if (_vigiles.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.security_outlined,
              size: 64,
              color: AppColors.gray400,
            ),
            SizedBox(height: AppSizes.md),
            Text(
              'Aucun vigile trouvé',
              style: AppTextStyles.headingSmall.copyWith(
                color: AppColors.gray600,
              ),
            ),
            SizedBox(height: AppSizes.sm),
            Text(
              'Ajoutez un vigile pour commencer',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(AppSizes.lg),
      itemCount: _vigiles.length,
      itemBuilder: (context, index) {
        final vigile = _vigiles[index];
        return _buildVigileCard(vigile);
      },
    );
  }

  Widget _buildComptableCard(Comptable comptable) {
    Color statusColor =
        comptable.statut == 'actif' ? AppColors.success : AppColors.danger;
    String statusText = comptable.statut == 'actif' ? 'Actif' : 'Inactif';

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
      child: Padding(
        padding: EdgeInsets.all(AppSizes.md),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 28,
              backgroundColor: AppColors.primary100,
              child: Text(
                '${comptable.prenom[0]}${comptable.nom[0]}',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.primary700,
                  fontSize: AppSizes.fontLg,
                ),
              ),
            ),

            SizedBox(width: AppSizes.md),

            // Informations
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${comptable.prenom} ${comptable.nom}',
                    style: AppTextStyles.headingSmall,
                  ),
                  SizedBox(height: AppSizes.xs),
                  Text(
                    'ID: ${comptable.idComptable}',
                    style: AppTextStyles.bodyMedium,
                  ),
                  Text(
                    comptable.email,
                    style: AppTextStyles.bodySmall,
                  ),
                  Text(
                    comptable.telephone,
                    style: AppTextStyles.bodySmall,
                  ),
                ],
              ),
            ),

            // Statut et actions
            Column(
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
                    statusText,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                SizedBox(height: AppSizes.sm),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon:
                          Icon(Icons.edit_rounded, color: AppColors.primary500),
                      onPressed: () => _showEditComptableDialog(comptable),
                      constraints: BoxConstraints(),
                      padding: EdgeInsets.all(8),
                    ),
                    IconButton(
                      icon: Icon(Icons.delete_rounded, color: AppColors.danger),
                      onPressed: () => _showDeleteConfirmation(
                          'comptable', comptable.id, comptable.nom),
                      constraints: BoxConstraints(),
                      padding: EdgeInsets.all(8),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVigileCard(Vigile vigile) {
    Color statusColor =
        vigile.statut == 'actif' ? AppColors.success : AppColors.danger;
    String statusText = vigile.statut == 'actif' ? 'Actif' : 'Inactif';

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
      child: Padding(
        padding: EdgeInsets.all(AppSizes.md),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 28,
              backgroundColor: AppColors.vigile.withOpacity(0.1),
              child: Text(
                '${vigile.prenom[0]}${vigile.nom[0]}',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.vigile,
                  fontSize: AppSizes.fontLg,
                ),
              ),
            ),

            SizedBox(width: AppSizes.md),

            // Informations
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${vigile.prenom} ${vigile.nom}',
                    style: AppTextStyles.headingSmall,
                  ),
                  SizedBox(height: AppSizes.xs),
                  Text(
                    'Poste: ${vigile.poste}',
                    style: AppTextStyles.bodyMedium,
                  ),
                  Text(
                    vigile.telephone,
                    style: AppTextStyles.bodySmall,
                  ),
                ],
              ),
            ),

            // Statut et actions
            Column(
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
                    statusText,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                SizedBox(height: AppSizes.sm),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: Icon(Icons.edit_rounded, color: AppColors.vigile),
                      onPressed: () => _showEditVigileDialog(vigile),
                      constraints: BoxConstraints(),
                      padding: EdgeInsets.all(8),
                    ),
                    IconButton(
                      icon: Icon(Icons.delete_rounded, color: AppColors.danger),
                      onPressed: () => _showDeleteConfirmation(
                          'vigile', vigile.id, vigile.nom),
                      constraints: BoxConstraints(),
                      padding: EdgeInsets.all(8),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showAddUserDialog() {
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
                Text(
                  'Ajouter un utilisateur',
                  style: AppTextStyles.headingMedium,
                ),
                SizedBox(height: AppSizes.lg),

                // Bouton Ajouter Comptable
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pop();
                      _showComptableForm();
                    },
                    icon: Icon(Icons.account_balance_wallet_rounded),
                    label: Text('Ajouter un Comptable'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary500,
                      foregroundColor: AppColors.white,
                      padding: EdgeInsets.symmetric(vertical: AppSizes.md),
                    ),
                  ),
                ),

                SizedBox(height: AppSizes.md),

                // Bouton Ajouter Vigile
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pop();
                      _showVigileForm();
                    },
                    icon: Icon(Icons.security_rounded),
                    label: Text('Ajouter un Vigile'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.vigile,
                      foregroundColor: AppColors.white,
                      padding: EdgeInsets.symmetric(vertical: AppSizes.md),
                    ),
                  ),
                ),

                SizedBox(height: AppSizes.md),

                // Bouton Annuler
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text('Annuler'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showComptableForm([Comptable? comptable]) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return ComptableFormDialog(
          comptable: comptable,
          onSaved: () {
            _loadComptables();
          },
        );
      },
    );
  }

  void _showVigileForm([Vigile? vigile]) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return VigileFormDialog(
          vigile: vigile,
          onSaved: () {
            _loadVigiles();
          },
        );
      },
    );
  }

  void _showEditComptableDialog(Comptable comptable) {
    _showComptableForm(comptable);
  }

  void _showEditVigileDialog(Vigile vigile) {
    _showVigileForm(vigile);
  }

  void _showDeleteConfirmation(String type, String id, String nom) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          title: Text('Confirmer la suppression'),
          content: Text('Êtes-vous sûr de vouloir supprimer $nom ?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(context).pop();
                await _deleteUser(type, id);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.danger,
                foregroundColor: AppColors.white,
              ),
              child: Text('Supprimer'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _deleteUser(String type, String id) async {
    try {
      if (type == 'comptable') {
        await _apiService.supprimerComptable(id);
        _loadComptables();
      } else {
        await _apiService.supprimerVigile(id);
        _loadVigiles();
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${type.toUpperCase()} supprimé avec succès'),
          backgroundColor: AppColors.success,
        ),
      );
    } catch (e) {
      _showErrorSnackBar('Erreur lors de la suppression: ${e.toString()}');
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.danger,
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}

// ===== FORMULAIRES =====

class ComptableFormDialog extends StatefulWidget {
  final Comptable? comptable;
  final VoidCallback onSaved;

  const ComptableFormDialog({
    Key? key,
    this.comptable,
    required this.onSaved,
  }) : super(key: key);

  @override
  _ComptableFormDialogState createState() => _ComptableFormDialogState();
}

class _ComptableFormDialogState extends State<ComptableFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nomController = TextEditingController();
  final _prenomController = TextEditingController();
  final _emailController = TextEditingController();
  final _telephoneController = TextEditingController();
  final _motDePasseController = TextEditingController();
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  bool _obscurePassword = true;

  bool get _isEditing => widget.comptable != null;

  @override
  void initState() {
    super.initState();
    if (_isEditing) {
      _nomController.text = widget.comptable!.nom;
      _prenomController.text = widget.comptable!.prenom;
      _emailController.text = widget.comptable!.email;
      _telephoneController.text = widget.comptable!.telephone;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        constraints: BoxConstraints(maxWidth: 400, maxHeight: 600),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
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
                        Icons.account_balance_wallet_rounded,
                        color: AppColors.white,
                        size: 24,
                      ),
                    ),
                    SizedBox(width: AppSizes.md),
                    Expanded(
                      child: Text(
                        _isEditing
                            ? 'Modifier le Comptable'
                            : 'Nouveau Comptable',
                        style: AppTextStyles.headingSmall,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(Icons.close_rounded),
                    ),
                  ],
                ),

                SizedBox(height: AppSizes.lg),

                // Formulaire
                _buildTextField(
                  controller: _nomController,
                  label: 'Nom',
                  hint: 'Nom de famille',
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Le nom est obligatoire';
                    }
                    return null;
                  },
                ),

                SizedBox(height: AppSizes.md),

                _buildTextField(
                  controller: _prenomController,
                  label: 'Prénom',
                  hint: 'Prénom',
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Le prénom est obligatoire';
                    }
                    return null;
                  },
                ),

                SizedBox(height: AppSizes.md),

                _buildTextField(
                  controller: _emailController,
                  label: 'Email',
                  hint: 'email@exemple.com',
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'L\'email est obligatoire';
                    }
                    if (!value.contains('@')) {
                      return 'Email invalide';
                    }
                    return null;
                  },
                ),

                SizedBox(height: AppSizes.md),

                _buildTextField(
                  controller: _telephoneController,
                  label: 'Téléphone',
                  hint: '+221 XX XXX XX XX',
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Le téléphone est obligatoire';
                    }
                    return null;
                  },
                ),

                SizedBox(height: AppSizes.md),

                _buildTextField(
                  controller: _motDePasseController,
                  label: _isEditing
                      ? 'Nouveau mot de passe (optionnel)'
                      : 'Mot de passe',
                  hint: 'Mot de passe',
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_rounded
                          : Icons.visibility_off_rounded,
                      color: AppColors.gray400,
                    ),
                  ),
                  validator: (value) {
                    if (!_isEditing && (value == null || value.isEmpty)) {
                      return 'Le mot de passe est obligatoire';
                    }
                    if (value != null && value.isNotEmpty && value.length < 6) {
                      return 'Minimum 6 caractères';
                    }
                    return null;
                  },
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
                        onPressed: _isLoading ? null : _saveComptable,
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
                            : Text(_isEditing ? 'Modifier' : 'Créer'),
                      ),
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

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelMedium,
        ),
        SizedBox(height: AppSizes.sm),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.gray400,
            ),
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: AppColors.gray50,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              borderSide: BorderSide(color: AppColors.gray200),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              borderSide: BorderSide(color: AppColors.gray200),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              borderSide: BorderSide(color: AppColors.primary500, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              borderSide: BorderSide(color: AppColors.danger),
            ),
            contentPadding: EdgeInsets.symmetric(
              horizontal: AppSizes.md,
              vertical: AppSizes.md,
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _saveComptable() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      if (_isEditing) {
        await _apiService.modifierComptable(
          comptableId: widget.comptable!.id,
          nom: _nomController.text.trim(),
          prenom: _prenomController.text.trim(),
          email: _emailController.text.trim(),
          telephone: _telephoneController.text.trim(),
          motDePasse: _motDePasseController.text.isNotEmpty
              ? _motDePasseController.text
              : null,
        );
      } else {
        await _apiService.creerComptable(
          nom: _nomController.text.trim(),
          prenom: _prenomController.text.trim(),
          email: _emailController.text.trim(),
          telephone: _telephoneController.text.trim(),
          motDePasse: _motDePasseController.text,
        );
      }

      Navigator.of(context).pop();
      widget.onSaved();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isEditing
              ? 'Comptable modifié avec succès'
              : 'Comptable créé avec succès'),
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
    _nomController.dispose();
    _prenomController.dispose();
    _emailController.dispose();
    _telephoneController.dispose();
    _motDePasseController.dispose();
    super.dispose();
  }
}

// ===== FORMULAIRE VIGILE =====

class VigileFormDialog extends StatefulWidget {
  final Vigile? vigile;
  final VoidCallback onSaved;

  const VigileFormDialog({
    Key? key,
    this.vigile,
    required this.onSaved,
  }) : super(key: key);

  @override
  _VigileFormDialogState createState() => _VigileFormDialogState();
}

class _VigileFormDialogState extends State<VigileFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nomController = TextEditingController();
  final _prenomController = TextEditingController();
  final _telephoneController = TextEditingController();
  final _codeAccesController = TextEditingController();
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  bool _obscurePassword = true;
  String _poste = 'porte_principale';

  final List<Map<String, String>> _postes = [
    {'value': 'porte_principale', 'label': 'Porte Principale'},
    {'value': 'porte_secondaire', 'label': 'Porte Secondaire'},
    {'value': 'batiment_a', 'label': 'Bâtiment A'},
    {'value': 'batiment_b', 'label': 'Bâtiment B'},
    {'value': 'parking', 'label': 'Parking'},
  ];

  bool get _isEditing => widget.vigile != null;

  @override
  void initState() {
    super.initState();
    if (_isEditing) {
      _nomController.text = widget.vigile!.nom;
      _prenomController.text = widget.vigile!.prenom;
      _telephoneController.text = widget.vigile!.telephone;
      _poste = widget.vigile!.poste;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusXl),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        constraints: BoxConstraints(maxWidth: 400, maxHeight: 600),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
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
                        gradient: AppColors.vigileGradient,
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: Icon(
                        Icons.security_rounded,
                        color: AppColors.white,
                        size: 24,
                      ),
                    ),
                    SizedBox(width: AppSizes.md),
                    Expanded(
                      child: Text(
                        _isEditing ? 'Modifier le Vigile' : 'Nouveau Vigile',
                        style: AppTextStyles.headingSmall,
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(Icons.close_rounded),
                    ),
                  ],
                ),

                SizedBox(height: AppSizes.lg),

                // Formulaire
                _buildTextField(
                  controller: _nomController,
                  label: 'Nom',
                  hint: 'Nom de famille',
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Le nom est obligatoire';
                    }
                    return null;
                  },
                ),

                SizedBox(height: AppSizes.md),

                _buildTextField(
                  controller: _prenomController,
                  label: 'Prénom',
                  hint: 'Prénom',
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Le prénom est obligatoire';
                    }
                    return null;
                  },
                ),

                SizedBox(height: AppSizes.md),

                _buildTextField(
                  controller: _telephoneController,
                  label: 'Téléphone',
                  hint: '+221 XX XXX XX XX',
                  keyboardType: TextInputType.phone,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Le téléphone est obligatoire';
                    }
                    return null;
                  },
                ),

                SizedBox(height: AppSizes.md),

                // Poste
                Text(
                  'Poste d\'affectation',
                  style: AppTextStyles.labelMedium,
                ),
                SizedBox(height: AppSizes.sm),
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.symmetric(horizontal: AppSizes.md),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.gray300),
                    borderRadius: BorderRadius.circular(AppSizes.radiusMd),
                    color: AppColors.gray50,
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _poste,
                      isExpanded: true,
                      onChanged: (String? newValue) {
                        setState(() {
                          _poste = newValue!;
                        });
                      },
                      items: _postes.map<DropdownMenuItem<String>>((poste) {
                        return DropdownMenuItem<String>(
                          value: poste['value'],
                          child: Text(poste['label']!),
                        );
                      }).toList(),
                    ),
                  ),
                ),

                SizedBox(height: AppSizes.md),

                _buildTextField(
                  controller: _codeAccesController,
                  label: _isEditing
                      ? 'Nouveau code d\'accès (optionnel)'
                      : 'Code d\'accès',
                  hint: 'Code d\'accès',
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_rounded
                          : Icons.visibility_off_rounded,
                      color: AppColors.gray400,
                    ),
                  ),
                  validator: (value) {
                    if (!_isEditing && (value == null || value.isEmpty)) {
                      return 'Le code d\'accès est obligatoire';
                    }
                    if (value != null && value.isNotEmpty && value.length < 4) {
                      return 'Minimum 4 caractères';
                    }
                    return null;
                  },
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
                        onPressed: _isLoading ? null : _saveVigile,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.vigile,
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
                            : Text(_isEditing ? 'Modifier' : 'Créer'),
                      ),
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

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.labelMedium,
        ),
        SizedBox(height: AppSizes.sm),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.gray400,
            ),
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: AppColors.gray50,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              borderSide: BorderSide(color: AppColors.gray200),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              borderSide: BorderSide(color: AppColors.gray200),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              borderSide: BorderSide(color: AppColors.vigile, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
              borderSide: BorderSide(color: AppColors.danger),
            ),
            contentPadding: EdgeInsets.symmetric(
              horizontal: AppSizes.md,
              vertical: AppSizes.md,
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _saveVigile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      if (_isEditing) {
        await _apiService.modifierVigile(
          vigileId: widget.vigile!.id,
          nom: _nomController.text.trim(),
          prenom: _prenomController.text.trim(),
          telephone: _telephoneController.text.trim(),
          poste: _poste,
          codeAcces: _codeAccesController.text.isNotEmpty
              ? _codeAccesController.text
              : null,
        );
      } else {
        await _apiService.creerVigile(
          nom: _nomController.text.trim(),
          prenom: _prenomController.text.trim(),
          telephone: _telephoneController.text.trim(),
          poste: _poste,
          codeAcces: _codeAccesController.text,
        );
      }

      Navigator.of(context).pop();
      widget.onSaved();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isEditing
              ? 'Vigile modifié avec succès'
              : 'Vigile créé avec succès'),
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
    _nomController.dispose();
    _prenomController.dispose();
    _telephoneController.dispose();
    _codeAccesController.dispose();
    super.dispose();
  }
}
