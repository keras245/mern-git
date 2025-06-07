import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../utils/constants.dart';
import '../../services/api_service.dart';

class ScannerQRScreen extends StatefulWidget {
  @override
  _ScannerQRScreenState createState() => _ScannerQRScreenState();
}

class _ScannerQRScreenState extends State<ScannerQRScreen>
    with TickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  final TextEditingController _qrController = TextEditingController();
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');

  QRViewController? controller;
  bool _isScanning = false;
  bool _cameraPermissionGranted = false;
  Map<String, dynamic>? _lastScanResult;

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  // Détecter si on est sur mobile ou web
  bool get isMobile =>
      !kIsWeb &&
      (Theme.of(context).platform == TargetPlatform.android ||
          Theme.of(context).platform == TargetPlatform.iOS);

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: Duration(seconds: 2),
      vsync: this,
    )..repeat();
    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    if (isMobile) {
      _requestCameraPermission();
    }
  }

  @override
  void dispose() {
    controller?.dispose();
    _pulseController.dispose();
    _qrController.dispose();
    super.dispose();
  }

  Future<void> _requestCameraPermission() async {
    final status = await Permission.camera.request();
    setState(() {
      _cameraPermissionGranted = status == PermissionStatus.granted;
    });
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      if (scanData.code != null && !_isScanning) {
        _processScanResult(scanData.code!);
      }
    });
  }

  Future<void> _processScanResult(String qrCode) async {
    if (_isScanning) return;

    setState(() {
      _isScanning = true;
      _lastScanResult = null;
    });

    // Pause le scanner pendant le traitement
    await controller?.pauseCamera();

    try {
      final result = await _apiService.scanQRCode(qrCode);

      setState(() {
        _lastScanResult = result;
        _isScanning = false;
      });

      // Feedback visuel et sonore
      HapticFeedback.lightImpact();
      _showScanResult(result);
    } catch (e) {
      setState(() {
        _isScanning = false;
      });
      _showSnackBar('Erreur: ${e.toString()}', AppColors.danger);
    } finally {
      // Reprendre le scanner après 3 secondes
      Future.delayed(Duration(seconds: 3), () {
        controller?.resumeCamera();
      });
    }
  }

  Future<void> _scanQRCodeManually() async {
    final qrCode = _qrController.text.trim();
    if (qrCode.isEmpty) {
      _showSnackBar('Veuillez saisir un code QR', AppColors.warning);
      return;
    }
    await _processScanResult(qrCode);
  }

  void _showScanResult(Map<String, dynamic> result) {
    final autorisation = result['autorisation'] ?? false;
    final message = result['message'] ?? 'Résultat inconnu';
    final etudiant = result['etudiant'];

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              autorisation ? Icons.check_circle : Icons.cancel,
              color: autorisation ? AppColors.success : AppColors.danger,
              size: 64,
            ),
            SizedBox(height: AppSizes.lg),
            Text(
              autorisation ? 'ACCÈS AUTORISÉ' : 'ACCÈS REFUSÉ',
              style: AppTextStyles.headingMedium.copyWith(
                color: autorisation ? AppColors.success : AppColors.danger,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            if (etudiant != null) ...[
              SizedBox(height: AppSizes.md),
              Text(
                '${etudiant['prenom']} ${etudiant['nom']}',
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              Text(
                'Matricule: ${etudiant['matricule']}',
                style: AppTextStyles.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
            SizedBox(height: AppSizes.md),
            Text(
              message,
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _qrController.clear();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  autorisation ? AppColors.success : AppColors.danger,
            ),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(AppSizes.lg),
      child: Column(
        children: [
          SizedBox(height: AppSizes.lg),

          // Mode caméra pour mobile
          if (isMobile && _cameraPermissionGranted)
            _buildCameraScanner()
          // Mode saisie manuelle pour web/desktop
          else
            _buildManualScanner(),

          SizedBox(height: AppSizes.xl),

          // Dernière vérification
          if (_lastScanResult != null) _buildLastResult(),
        ],
      ),
    );
  }

  Widget _buildCameraScanner() {
    return Column(
      children: [
        Text(
          '📱 Scanner avec la caméra',
          style: AppTextStyles.headingMedium.copyWith(
            color: AppColors.vigile,
          ),
        ),
        SizedBox(height: AppSizes.lg),
        Container(
          width: 300,
          height: 300,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSizes.radiusXl),
            border: Border.all(color: AppColors.vigile, width: 3),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppSizes.radiusXl),
            child: QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
              overlay: QrScannerOverlayShape(
                borderColor: AppColors.vigile,
                borderRadius: AppSizes.radiusLg,
                borderLength: 30,
                borderWidth: 10,
                cutOutSize: 250,
              ),
            ),
          ),
        ),
        SizedBox(height: AppSizes.lg),
        if (_isScanning)
          Container(
            padding: EdgeInsets.all(AppSizes.md),
            decoration: BoxDecoration(
              color: AppColors.vigile.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppSizes.radiusLg),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: AppColors.vigile,
                    strokeWidth: 2,
                  ),
                ),
                SizedBox(width: AppSizes.sm),
                Text('Vérification en cours...'),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildManualScanner() {
    return Column(
      children: [
        AnimatedBuilder(
          animation: _pulseAnimation,
          builder: (context, child) {
            return Transform.scale(
              scale: _pulseAnimation.value,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  border: Border.all(
                    color: AppColors.vigile,
                    width: 3,
                  ),
                  borderRadius: BorderRadius.circular(AppSizes.radiusXl),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.qr_code_scanner,
                        size: 80,
                        color: AppColors.vigile,
                      ),
                      SizedBox(height: AppSizes.md),
                      Text(
                        isMobile
                            ? 'Permission caméra requise'
                            : '💻 Saisir le QR Code',
                        style: AppTextStyles.bodyLarge.copyWith(
                          color: AppColors.vigile,
                          fontWeight: FontWeight.w600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),

        SizedBox(height: AppSizes.xl),

        // Champ de saisie QR
        Card(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          ),
          child: Padding(
            padding: EdgeInsets.all(AppSizes.lg),
            child: Column(
              children: [
                TextField(
                  controller: _qrController,
                  decoration: InputDecoration(
                    labelText: 'Code QR de l\'étudiant',
                    hintText: 'Saisir ou coller le code QR',
                    prefixIcon: Icon(Icons.qr_code, color: AppColors.vigile),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                      borderSide: BorderSide(color: AppColors.vigile, width: 2),
                    ),
                  ),
                  maxLines: 3,
                  minLines: 1,
                ),
                SizedBox(height: AppSizes.lg),

                // Bouton scan
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isScanning ? null : _scanQRCodeManually,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.vigile,
                      foregroundColor: AppColors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
                      ),
                      elevation: 4,
                    ),
                    child: _isScanning
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
                              Text('Vérification...'),
                            ],
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.search),
                              SizedBox(width: AppSizes.sm),
                              Text('VÉRIFIER L\'ACCÈS'),
                            ],
                          ),
                  ),
                ),

                // Bouton pour demander permission caméra sur mobile
                if (isMobile && !_cameraPermissionGranted) ...[
                  SizedBox(height: AppSizes.md),
                  TextButton.icon(
                    onPressed: _requestCameraPermission,
                    icon: Icon(Icons.camera_alt),
                    label: Text('Activer la caméra'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.vigile,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLastResult() {
    final autorisation = _lastScanResult!['autorisation'] ?? false;
    final etudiant = _lastScanResult!['etudiant'];
    final message = _lastScanResult!['message'] ?? '';

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLg),
      ),
      child: Container(
        padding: EdgeInsets.all(AppSizes.lg),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppSizes.radiusLg),
          color: autorisation
              ? AppColors.success.withOpacity(0.1)
              : AppColors.danger.withOpacity(0.1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  autorisation ? Icons.check_circle : Icons.cancel,
                  color: autorisation ? AppColors.success : AppColors.danger,
                  size: 24,
                ),
                SizedBox(width: AppSizes.sm),
                Text(
                  'Dernière vérification',
                  style: AppTextStyles.headingSmall,
                ),
              ],
            ),
            SizedBox(height: AppSizes.md),
            if (etudiant != null) ...[
              Text(
                '${etudiant['prenom']} ${etudiant['nom']}',
                style: AppTextStyles.bodyLarge
                    .copyWith(fontWeight: FontWeight.w600),
              ),
              Text(
                'Matricule: ${etudiant['matricule']}',
                style: AppTextStyles.bodyMedium,
              ),
              SizedBox(height: AppSizes.sm),
            ],
            Container(
              padding: EdgeInsets.all(AppSizes.md),
              decoration: BoxDecoration(
                color: autorisation ? AppColors.success : AppColors.danger,
                borderRadius: BorderRadius.circular(AppSizes.radiusSm),
              ),
              child: Row(
                children: [
                  Icon(
                    autorisation ? Icons.check : Icons.close,
                    color: AppColors.white,
                    size: 20,
                  ),
                  SizedBox(width: AppSizes.sm),
                  Expanded(
                    child: Text(
                      message,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.w500,
                      ),
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
}
