import 'package:flutter/material.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';

class HistoriqueAccesScreen extends StatefulWidget {
  @override
  _HistoriqueAccesScreenState createState() => _HistoriqueAccesScreenState();
}

class _HistoriqueAccesScreenState extends State<HistoriqueAccesScreen> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _historique = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadHistorique();
  }

  Future<void> _loadHistorique() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await _apiService.getHistoriqueAcces();
      setState(() {
        _historique = List<Map<String, dynamic>>.from(data);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadHistorique,
      color: AppColors.vigile,
      child: SingleChildScrollView(
        physics: AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.all(AppSizes.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: AppSizes.md),
            Text(
              'Historique des Accès',
              style: AppTextStyles.headingLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.gray800,
              ),
            ),
            SizedBox(height: AppSizes.lg),
            if (_isLoading)
              _buildLoading()
            else if (_error != null)
              _buildError()
            else if (_historique.isEmpty)
              _buildEmpty()
            else
              _buildHistorique(),
          ],
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: Column(
        children: [
          SizedBox(height: AppSizes.xl),
          CircularProgressIndicator(color: AppColors.vigile),
          SizedBox(height: AppSizes.lg),
          Text(
            'Chargement de l\'historique...',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.gray600),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Card(
        child: Padding(
          padding: EdgeInsets.all(AppSizes.lg),
          child: Column(
            children: [
              Icon(Icons.error, color: AppColors.danger, size: 48),
              SizedBox(height: AppSizes.md),
              Text('Erreur de chargement', style: AppTextStyles.headingSmall),
              SizedBox(height: AppSizes.sm),
              Text(_error!, style: AppTextStyles.bodySmall),
              SizedBox(height: AppSizes.md),
              ElevatedButton(
                onPressed: _loadHistorique,
                child: Text('Réessayer'),
                style:
                    ElevatedButton.styleFrom(backgroundColor: AppColors.vigile),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Card(
        child: Padding(
          padding: EdgeInsets.all(AppSizes.xl),
          child: Column(
            children: [
              Icon(Icons.history, color: AppColors.gray400, size: 64),
              SizedBox(height: AppSizes.lg),
              Text(
                'Aucun accès enregistré',
                style: AppTextStyles.headingMedium
                    .copyWith(color: AppColors.gray600),
              ),
              SizedBox(height: AppSizes.sm),
              Text(
                'L\'historique des scans apparaîtra ici',
                style:
                    AppTextStyles.bodyMedium.copyWith(color: AppColors.gray500),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHistorique() {
    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: _historique.length,
      itemBuilder: (context, index) {
        final acces = _historique[index];
        return _buildAccesCard(acces);
      },
    );
  }

  Widget _buildAccesCard(Map<String, dynamic> acces) {
    final autorisation = acces['autorisation'] ?? false;
    final etudiant = acces['etudiant_id'] ?? {};
    final date = acces['createdAt'];

    return Card(
      margin: EdgeInsets.only(bottom: AppSizes.md),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          border: Border.all(
            color: autorisation ? AppColors.success : AppColors.danger,
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: autorisation
                        ? AppColors.success.withOpacity(0.1)
                        : AppColors.danger.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    autorisation ? Icons.check_circle : Icons.cancel,
                    color: autorisation ? AppColors.success : AppColors.danger,
                    size: 20,
                  ),
                ),
                SizedBox(width: AppSizes.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        autorisation ? 'ACCÈS AUTORISÉ' : 'ACCÈS REFUSÉ',
                        style: AppTextStyles.labelMedium.copyWith(
                          color: autorisation
                              ? AppColors.success
                              : AppColors.danger,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _formatDate(date),
                        style: AppTextStyles.bodySmall
                            .copyWith(color: AppColors.gray600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (etudiant.isNotEmpty) ...[
              SizedBox(height: AppSizes.md),
              Container(
                padding: EdgeInsets.all(AppSizes.md),
                decoration: BoxDecoration(
                  color: AppColors.gray50,
                  borderRadius: BorderRadius.circular(AppSizes.radiusSm),
                ),
                child: Row(
                  children: [
                    Icon(Icons.person, color: AppColors.gray600, size: 20),
                    SizedBox(width: AppSizes.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${etudiant['prenom'] ?? ''} ${etudiant['nom'] ?? ''}',
                            style: AppTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            'Matricule: ${etudiant['matricule'] ?? 'N/A'}',
                            style: AppTextStyles.bodySmall,
                          ),
                        ],
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

  String _formatDate(dynamic date) {
    if (date == null) return 'Date inconnue';
    try {
      final DateTime parsedDate = DateTime.parse(date.toString());
      return '${parsedDate.day.toString().padLeft(2, '0')}/${parsedDate.month.toString().padLeft(2, '0')}/${parsedDate.year} à ${parsedDate.hour.toString().padLeft(2, '0')}:${parsedDate.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return 'Date invalide';
    }
  }
}
