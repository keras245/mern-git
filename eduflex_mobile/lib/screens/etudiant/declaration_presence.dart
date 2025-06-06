import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';

class DeclarationPresence extends StatefulWidget {
  final bool hasAccess;

  const DeclarationPresence({Key? key, required this.hasAccess})
      : super(key: key);

  @override
  _DeclarationPresenceState createState() => _DeclarationPresenceState();
}

class _DeclarationPresenceState extends State<DeclarationPresence> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _coursAujourdhui = [];
  List<Map<String, dynamic>> _presencesDeclarees = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      // Simuler les cours d'aujourd'hui (à remplacer par vraie API)
      setState(() {
        _coursAujourdhui = [
          {
            'id': '1',
            'matiere': 'Programmation Web',
            'professeur': 'Dr. Camara',
            'salle': 'A101',
            'heureDebut': '08:30',
            'heureFin': '11:30',
            'peutDeclarer': _canDeclarePresence('08:30', '11:30'),
          },
          {
            'id': '2',
            'matiere': 'Base de données',
            'professeur': 'Prof. Diallo',
            'salle': 'B205',
            'heureDebut': '14:00',
            'heureFin': '17:00',
            'peutDeclarer': _canDeclarePresence('14:00', '17:00'),
          },
        ];
        _isLoading = false;
      });
    } catch (error) {
      print('Erreur chargement données: $error');
      setState(() => _isLoading = false);
    }
  }

  bool _canDeclarePresence(String heureDebut, String heureFin) {
    final now = DateTime.now();
    final todayStr =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

    final debut = DateTime.parse('$todayStr ${heureDebut}:00');
    final fin = DateTime.parse('$todayStr ${heureFin}:00');
    final limiteDeclation = fin.subtract(Duration(minutes: 45));

    return now.isAfter(limiteDeclation) && now.isBefore(fin);
  }

  Future<void> _declarerPresence(String coursId) async {
    if (!widget.hasAccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Vous devez d\'abord passer par l\'entrée principale'),
          backgroundColor: AppColors.red500,
        ),
      );
      return;
    }

    try {
      // Simuler la déclaration (à remplacer par vraie API)
      setState(() {
        _presencesDeclarees.add(coursId);
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Présence déclarée avec succès'),
          backgroundColor: AppColors.green500,
        ),
      );
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la déclaration'),
          backgroundColor: AppColors.red500,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.gray50,
      appBar: AppBar(
        backgroundColor: AppColors.primary500,
        foregroundColor: AppColors.white,
        title: Text('Déclaration de présence'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Statut d'accès
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: widget.hasAccess
                          ? AppColors.green50
                          : AppColors.red50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: widget.hasAccess
                            ? AppColors.green200
                            : AppColors.red200,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          widget.hasAccess ? Icons.check_circle : Icons.cancel,
                          color: widget.hasAccess
                              ? AppColors.green600
                              : AppColors.red600,
                          size: 32,
                        ),
                        SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.hasAccess
                                    ? 'Accès validé'
                                    : 'Accès requis',
                                style: TextStyle(
                                  color: widget.hasAccess
                                      ? AppColors.green800
                                      : AppColors.red800,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                widget.hasAccess
                                    ? 'Vous pouvez déclarer votre présence'
                                    : 'Scannez votre QR code à l\'entrée d\'abord',
                                style: TextStyle(
                                  color: widget.hasAccess
                                      ? AppColors.green600
                                      : AppColors.red600,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 24),

                  Text(
                    'Cours d\'aujourd\'hui',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.gray900,
                    ),
                  ),

                  SizedBox(height: 16),

                  if (_coursAujourdhui.isEmpty)
                    _buildEmptyState()
                  else
                    ..._coursAujourdhui
                        .map((cours) => _buildCoursCard(cours))
                        .toList(),
                ],
              ),
            ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(
            Icons.schedule_outlined,
            size: 64,
            color: AppColors.gray400,
          ),
          SizedBox(height: 16),
          Text(
            'Aucun cours aujourd\'hui',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.gray600,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Profitez de votre journée libre !',
            style: TextStyle(
              color: AppColors.gray500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCoursCard(Map<String, dynamic> cours) {
    final isDeclaree = _presencesDeclarees.contains(cours['id']);
    final peutDeclarer =
        cours['peutDeclarer'] && widget.hasAccess && !isDeclaree;

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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      cours['matiere'],
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
                          cours['salle'],
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
                            cours['professeur'],
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
              if (isDeclaree)
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.green100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.check_circle,
                        size: 16,
                        color: AppColors.green600,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Déclarée',
                        style: TextStyle(
                          color: AppColors.green700,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                )
              else if (peutDeclarer)
                ElevatedButton(
                  onPressed: () => _declarerPresence(cours['id']),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary500,
                    foregroundColor: AppColors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text('Déclarer'),
                )
              else
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.gray100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Non disponible',
                    style: TextStyle(
                      color: AppColors.gray600,
                      fontSize: 12,
                    ),
                  ),
                ),
            ],
          ),
          if (!cours['peutDeclarer'] && !isDeclaree)
            Padding(
              padding: EdgeInsets.only(top: 8),
              child: Text(
                'Déclaration possible 45 min avant la fin du cours',
                style: TextStyle(
                  color: AppColors.gray500,
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
