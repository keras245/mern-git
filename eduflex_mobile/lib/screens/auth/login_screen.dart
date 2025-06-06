import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../utils/constants.dart';
import '../../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  final String userType;

  const LoginScreen({Key? key, required this.userType}) : super(key: key);

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _field1Controller =
      TextEditingController(); // matricule/email/telephone
  final _field2Controller = TextEditingController(); // mot_de_passe/code_acces
  bool _obscurePassword = true;
  bool _isLoading = false;

  // Configuration selon le type d'utilisateur
  Map<String, dynamic> get _config {
    switch (widget.userType) {
      case 'etudiant':
        return {
          'title': 'Connexion Étudiant',
          'icon': '🎓',
          'gradient': AppColors.etudiantGradient,
          'field1Label': 'Matricule',
          'field1Hint': 'Votre matricule étudiant',
          'field2Label': 'Mot de passe',
          'field2Hint': 'Votre mot de passe',
        };
      case 'comptable':
        return {
          'title': 'Connexion Comptable',
          'icon': '💰',
          'gradient': AppColors.comptableGradient,
          'field1Label': 'Email',
          'field1Hint': 'votre.email@exemple.com',
          'field2Label': 'Mot de passe',
          'field2Hint': 'Votre mot de passe',
        };
      case 'vigile':
        return {
          'title': 'Connexion Vigile',
          'icon': '🔍',
          'gradient': AppColors.vigileGradient,
          'field1Label': 'Téléphone',
          'field1Hint': 'Votre numéro de téléphone',
          'field2Label': 'Code d\'accès',
          'field2Hint': 'Votre code d\'accès',
        };
      default:
        return {};
    }
  }

  @override
  Widget build(BuildContext context) {
    final config = _config;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary50,
              AppColors.white,
              AppColors.primary100,
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(AppSizes.lg),
            child: Column(
              children: [
                SizedBox(height: AppSizes.xxl),

                // Header avec icône et titre
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: config['gradient'],
                    borderRadius: BorderRadius.circular(AppSizes.radius2Xl),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary500.withOpacity(0.3),
                        blurRadius: 20,
                        offset: Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      config['icon'],
                      style: TextStyle(fontSize: 32),
                    ),
                  ),
                ),

                SizedBox(height: AppSizes.lg),

                Text(
                  config['title'],
                  style: AppTextStyles.headingLarge,
                ),

                SizedBox(height: AppSizes.sm),

                Text(
                  'Connectez-vous à votre compte',
                  style: AppTextStyles.bodyMedium,
                ),

                SizedBox(height: AppSizes.xxl),

                // Formulaire de connexion
                Container(
                  padding: EdgeInsets.all(AppSizes.lg),
                  decoration: BoxDecoration(
                    color: AppColors.white.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(AppSizes.radius2Xl),
                    border: Border.all(
                      color: AppColors.white.withOpacity(0.5),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.gray200.withOpacity(0.5),
                        blurRadius: 20,
                        offset: Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        // Premier champ (matricule/email/téléphone)
                        _buildInputField(
                          controller: _field1Controller,
                          label: config['field1Label'],
                          hint: config['field1Hint'],
                          keyboardType: widget.userType == 'comptable'
                              ? TextInputType.emailAddress
                              : TextInputType.text,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Ce champ est obligatoire';
                            }
                            if (widget.userType == 'comptable' &&
                                !value.contains('@')) {
                              return 'Veuillez entrer un email valide';
                            }
                            return null;
                          },
                        ),

                        SizedBox(height: AppSizes.lg),

                        // Deuxième champ (mot de passe/code d'accès)
                        _buildInputField(
                          controller: _field2Controller,
                          label: config['field2Label'],
                          hint: config['field2Hint'],
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
                            if (value == null || value.isEmpty) {
                              return 'Ce champ est obligatoire';
                            }
                            if (value.length < 4) {
                              return 'Minimum 4 caractères';
                            }
                            return null;
                          },
                        ),

                        SizedBox(height: AppSizes.xl),

                        // Bouton de connexion
                        Container(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _handleLogin,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              padding: EdgeInsets.zero,
                              shape: RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.circular(AppSizes.radiusLg),
                              ),
                            ),
                            child: Container(
                              decoration: BoxDecoration(
                                gradient: config['gradient'],
                                borderRadius:
                                    BorderRadius.circular(AppSizes.radiusLg),
                              ),
                              child: Center(
                                child: _isLoading
                                    ? CircularProgressIndicator(
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                          AppColors.white,
                                        ),
                                      )
                                    : Text(
                                        'Se connecter',
                                        style:
                                            AppTextStyles.labelMedium.copyWith(
                                          color: AppColors.white,
                                          fontSize: AppSizes.fontLg,
                                        ),
                                      ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: AppSizes.lg),

                // Bouton retour
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.arrow_back_rounded,
                        color: AppColors.gray500,
                        size: 20,
                      ),
                      SizedBox(width: AppSizes.sm),
                      Text(
                        'Retour à la sélection',
                        style: AppTextStyles.bodyMedium,
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

  Widget _buildInputField({
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

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authService = Provider.of<AuthService>(context, listen: false);

      bool success = false;

      switch (widget.userType) {
        case 'etudiant':
          success = await authService.loginEtudiant(
            _field1Controller.text.trim(),
            _field2Controller.text,
          );
          break;
        case 'comptable':
          success = await authService.loginComptable(
            _field1Controller.text.trim(),
            _field2Controller.text,
          );
          break;
        case 'vigile':
          success = await authService.loginVigile(
            _field1Controller.text.trim(),
            _field2Controller.text,
          );
          break;
      }

      if (success) {
        // La navigation sera gérée automatiquement par AuthWrapper
        Navigator.of(context).pushReplacementNamed('/');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSizes.radiusMd),
          ),
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _field1Controller.dispose();
    _field2Controller.dispose();
    super.dispose();
  }
}
