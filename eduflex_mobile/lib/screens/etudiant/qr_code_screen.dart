import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';
import '../../models/etudiant.dart';
import '../../services/api_service.dart';

class QRCodeScreen extends StatefulWidget {
  final Etudiant? etudiant;

  const QRCodeScreen({Key? key, required this.etudiant}) : super(key: key);

  @override
  _QRCodeScreenState createState() => _QRCodeScreenState();
}

class _QRCodeScreenState extends State<QRCodeScreen> {
  final ApiService _apiService = ApiService();
  String? _qrData;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _generateQRCode();
  }

  Future<void> _generateQRCode() async {
    if (widget.etudiant == null) return;

    setState(() => _isLoading = true);

    try {
      final response = await _apiService.generateQRCode(widget.etudiant!.id);
      setState(() {
        _qrData = response['qrData'];
        _isLoading = false;
      });
    } catch (error) {
      print('Erreur génération QR Code: $error');
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
        title: Text('Mon QR Code'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _generateQRCode,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            // Carte QR Code
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gray900.withOpacity(0.1),
                    blurRadius: 10,
                    offset: Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    'Code QR d\'accès',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.gray900,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Présentez ce code au vigile',
                    style: TextStyle(
                      color: AppColors.gray600,
                    ),
                  ),
                  SizedBox(height: 24),
                  if (_isLoading)
                    Container(
                      width: 250,
                      height: 250,
                      child: Center(
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(
                              AppColors.primary500),
                        ),
                      ),
                    )
                  else if (_qrData != null)
                    Container(
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.gray200),
                      ),
                      child: QrImageView(
                        data: _qrData!,
                        version: QrVersions.auto,
                        size: 250.0,
                        backgroundColor: AppColors.white,
                        foregroundColor: AppColors.gray900,
                      ),
                    )
                  else
                    Container(
                      width: 250,
                      height: 250,
                      decoration: BoxDecoration(
                        color: AppColors.gray100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              size: 48,
                              color: AppColors.gray400,
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Erreur de génération',
                              style: TextStyle(
                                color: AppColors.gray600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _generateQRCode,
                    icon: Icon(Icons.refresh),
                    label: Text('Actualiser le code'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary500,
                      foregroundColor: AppColors.white,
                      padding:
                          EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 20),

            // Informations étudiant
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gray900.withOpacity(0.05),
                    blurRadius: 5,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Mes informations',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.gray900,
                    ),
                  ),
                  SizedBox(height: 16),
                  if (widget.etudiant != null) ...[
                    _buildInfoRow('Nom complet',
                        '${widget.etudiant!.prenom} ${widget.etudiant!.nom}'),
                    _buildInfoRow('Matricule', widget.etudiant!.matricule),
                    _buildInfoRow('Email', widget.etudiant!.email),
                    _buildInfoRow('Programme',
                        widget.etudiant!.programme ?? 'Non défini'),
                  ] else
                    Text(
                      'Informations non disponibles',
                      style: TextStyle(
                        color: AppColors.gray500,
                      ),
                    ),
                ],
              ),
            ),

            SizedBox(height: 20),

            // Instructions
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.blue50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.blue200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: AppColors.blue600,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Instructions',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.blue800,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),
                  Text(
                    '• Présentez ce QR code au vigile à l\'entrée\n'
                    '• Le code est valide pendant 5 minutes\n'
                    '• Actualisez le code si nécessaire\n'
                    '• L\'accès dépend de votre statut de paiement',
                    style: TextStyle(
                      color: AppColors.blue700,
                      height: 1.5,
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

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: AppColors.gray600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: AppColors.gray900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
