import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';
import 'utils/constants.dart';
import 'screens/auth/role_selection_screen.dart';
import 'screens/etudiant/etudiant_dashboard.dart';
import 'screens/comptable/comptable_dashboard.dart';
import 'screens/vigile/vigile_dashboard.dart';

void main() {
  print('🚀 [MAIN] Démarrage EduFlex');

  if (kIsWeb) {
    print('🌐 [MAIN] Mode Web');
  }

  runApp(EduFlexApp());
}

class EduFlexApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    print('🏗️ [APP] Construction app');

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
      ],
      child: MaterialApp(
        title: 'EduFlex',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          fontFamily: 'Roboto',
        ),
        home: AppNavigator(),
        routes: {
          '/role-selection': (context) => RoleSelectionScreen(),
          '/etudiant': (context) => EtudiantDashboard(),
          '/comptable': (context) => ComptableDashboard(),
          '/vigile': (context) => VigileScreen(),
        },
      ),
    );
  }
}

class AppNavigator extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    print('📍 [NAVIGATOR] Build');

    return Consumer<AuthService>(
      builder: (context, authService, child) {
        print(
            '🔍 [NAVIGATOR] Auth state - Loading: ${authService.isLoading}, Authenticated: ${authService.isAuthenticated}, Type: ${authService.userType}');

        // Chargement (uniquement pendant les connexions)
        if (authService.isLoading) {
          print('⏳ [NAVIGATOR] Mode chargement');
          return Scaffold(
            backgroundColor: AppColors.white,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppColors.primary500),
                  SizedBox(height: AppSizes.lg),
                  Text(
                    'Connexion...',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.gray600,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // Non authentifié = sélection des rôles
        if (!authService.isAuthenticated) {
          print('👤 [NAVIGATOR] Non authentifié -> Sélection rôles');
          return RoleSelectionScreen();
        }

        // Authentifié = redirection selon le rôle
        print('✅ [NAVIGATOR] Authentifié -> Rôle: ${authService.userType}');
        switch (authService.userType) {
          case 'etudiant':
            return EtudiantDashboard();
          case 'comptable':
            return ComptableDashboard();
          case 'vigile':
            return VigileScreen();
          default:
            print('❓ [NAVIGATOR] Rôle inconnu, retour sélection');
            return RoleSelectionScreen();
        }
      },
    );
  }
}
