import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';
import 'screens/auth/role_selection_screen.dart';
import 'screens/comptable/comptable_dashboard.dart';
import 'screens/vigile/vigile_dashboard.dart';
import 'screens/etudiant/etudiant_dashboard.dart';
import 'utils/constants.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => AuthService(),
      child: MaterialApp(
        title: 'EduFlex Mobile',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          primaryColor: AppColors.primary500,
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.primary500,
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          fontFamily: 'System', // Utilise la police système
        ),
        home: AuthWrapper(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  @override
  _AuthWrapperState createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    // Vérifier l'état d'authentification au démarrage
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AuthService>().checkAuthStatus();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthService>(
      builder: (context, authService, child) {
        if (authService.isLoading) {
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
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(AppSizes.radius2Xl),
                      ),
                      child: Icon(
                        Icons.school_rounded,
                        size: 40,
                        color: AppColors.white,
                      ),
                    ),
                    SizedBox(height: AppSizes.lg),
                    CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.primary500,
                      ),
                    ),
                    SizedBox(height: AppSizes.lg),
                    Text(
                      'EduFlex Mobile',
                      style: AppTextStyles.headingMedium,
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        if (!authService.isAuthenticated) {
          return RoleSelectionScreen();
        }

        // Router selon le type d'utilisateur
        switch (authService.userType) {
          case 'comptable':
            return ComptableDashboard();
          case 'vigile':
            return VigileScreen();
          case 'etudiant':
            return EtudiantDashboard();
          default:
            return RoleSelectionScreen();
        }
      },
    );
  }
}
