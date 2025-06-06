import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';
import '../../models/etudiant.dart';
import '../../services/api_service.dart';

class QRCodeScreen extends StatefulWidget {
  @override
  _QRCodeScreenState createState() => _QRCodeScreenState();
}

class _QRCodeScreenState extends State<QRCodeScreen> {
  Map<String, dynamic>? userData;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  _loadUserData() async {
    try {
      final user = await AuthService.getCurrentUser();
      setState(() {
        userData = user;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Mon QR Code'),
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
            ? Center(child: CircularProgressIndicator(color: AppColors.white))
            : _buildQRContent(),
      ),
    );
  }

  Widget _buildQRContent() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Column(
        children: [
          _buildInfoCard(),
          SizedBox(height: AppSizes.xl),
          _buildQRCard(),
          SizedBox(height: AppSizes.xl),
          _buildInstructions(),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: AppColors.etudiantGradient,
                borderRadius: BorderRadius.circular(40),
              ),
              child: Center(
                child: Text('🎓', style: TextStyle(fontSize: 40)),
              ),
            ),
            SizedBox(height: AppSizes.md),
            Text(
              '${userData?['prenom']} ${userData?['nom']}',
              style: AppTextStyles.headingMedium,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: AppSizes.sm),
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: AppSizes.md,
                vertical: AppSizes.sm,
              ),
              decoration: BoxDecoration(
                color: AppColors.etudiant.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSizes.radiusSm),
              ),
              child: Text(
                'Matricule: ${userData?['matricule']}',
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.etudiant,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQRCard() {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.xl),
        child: Column(
          children: [
            Text(
              'Code QR d\'Accès',
              style: AppTextStyles.headingSmall,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: AppSizes.lg),
            Container(
              padding: EdgeInsets.all(AppSizes.lg),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gray300,
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: QrImageView(
                data: userData?['qr_code'] ?? userData?['matricule'] ?? 'NO_QR',
                version: QrVersions.auto,
                size: 200.0,
                backgroundColor: AppColors.white,
                foregroundColor: AppColors.gray900,
              ),
            ),
            SizedBox(height: AppSizes.lg),
            Text(
              'Présentez ce code au vigile pour l\'accès',
              style: AppTextStyles.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructions() {
    final instructions = [
      {
        'icon': Icons.qr_code_scanner,
        'title': 'Scanner à l\'entrée',
        'description':
            'Présentez votre QR code au vigile à l\'entrée de la faculté',
      },
      {
        'icon': Icons.security,
        'title': 'Vérification automatique',
        'description': 'Le système vérifie automatiquement vos paiements',
      },
      {
        'icon': Icons.check_circle,
        'title': 'Accès autorisé',
        'description': 'Vous pouvez entrer si vos paiements sont à jour',
      },
    ];

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
              'Instructions d\'utilisation',
              style: AppTextStyles.headingSmall,
            ),
            SizedBox(height: AppSizes.lg),
            ...instructions.map((instruction) {
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
                        instruction['icon'] as IconData,
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
                            instruction['title'] as String,
                            style: AppTextStyles.labelMedium,
                          ),
                          SizedBox(height: 4),
                          Text(
                            instruction['description'] as String,
                            style: AppTextStyles.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}
