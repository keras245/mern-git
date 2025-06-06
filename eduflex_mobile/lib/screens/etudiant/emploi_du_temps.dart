import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';

class EmploiDuTemps extends StatefulWidget {
  final String etudiantId;

  const EmploiDuTemps({Key? key, required this.etudiantId}) : super(key: key);

  @override
  _EmploiDuTempsState createState() => _EmploiDuTempsState();
}

class _EmploiDuTempsState extends State<EmploiDuTemps> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _emploiDuTemps = [];
  bool _isLoading = true;
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _loadEmploiDuTemps();
  }

  Future<void> _loadEmploiDuTemps() async {
    try {
      final emploi = await _apiService.getEmploiDuTemps(widget.etudiantId);
      setState(() {
        _emploiDuTemps = emploi;
        _isLoading = false;
      });
    } catch (error) {
      print('Erreur chargement emploi du temps: $error');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.gray50,
      appBar: AppBar(
        backgroundColor: AppColors.primary500,
        foregroundColor: AppColors.white,
        title: Text('Emploi du temps'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _emploiDuTemps.isEmpty
              ? _buildEmptyState()
              : _buildEmploiContent(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.schedule_outlined,
            size: 64,
            color: AppColors.gray400,
          ),
          SizedBox(height: 16),
          Text(
            'Aucun cours programmé',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.gray600,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Votre emploi du temps sera disponible bientôt',
            style: TextStyle(
              color: AppColors.gray500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmploiContent() {
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: _emploiDuTemps.length,
      itemBuilder: (context, index) {
        final cours = _emploiDuTemps[index];
        return Container(
          margin: EdgeInsets.only(bottom: 12),
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: AppColors.gray900.withOpacity(0.1),
                blurRadius: 5,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 60,
                decoration: BoxDecoration(
                  color: AppColors.primary500,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      cours['matiere'] ?? 'Matière inconnue',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColors.gray900,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '${cours['heureDebut']} - ${cours['heureFin']}',
                      style: TextStyle(
                        color: AppColors.primary500,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 16,
                          color: AppColors.gray500,
                        ),
                        SizedBox(width: 4),
                        Text(
                          cours['salle'] ?? 'Salle non définie',
                          style: TextStyle(
                            color: AppColors.gray600,
                            fontSize: 14,
                          ),
                        ),
                        SizedBox(width: 16),
                        Icon(
                          Icons.person_outline,
                          size: 16,
                          color: AppColors.gray500,
                        ),
                        SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            cours['professeur'] ?? 'Professeur non défini',
                            style: TextStyle(
                              color: AppColors.gray600,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
