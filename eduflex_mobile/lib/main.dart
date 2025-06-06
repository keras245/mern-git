import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';
import 'screens/auth/role_selection_screen.dart';
import 'screens/comptable/comptable_dashboard.dart';
import 'screens/vigile/vigile_dashboard.dart';
import 'screens/etudiant/etudiant_dashboard.dart';
import 'screens/auth/login_screen.dart';
import 'navigation/comptable_navigator.dart';
import 'navigation/vigile_navigator.dart';
import 'navigation/etudiant_navigator.dart';
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
        home: AuthCheck(),
        routes: {
          '/login': (context) => RoleSelectionScreen(),
          '/comptable': (context) => ComptableNavigator(),
          '/vigile': (context) => VigileNavigator(),
          '/etudiant': (context) => EtudiantNavigator(),
        },
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class AuthCheck extends StatefulWidget {
  @override
  _AuthCheckState createState() => _AuthCheckState();
}

class _AuthCheckState extends State<AuthCheck> {
  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
  }

  _checkAuthStatus() async {
    try {
      final user = await AuthService.getCurrentUser();
      if (user != null) {
        String route;
        switch (user['type']) {
          case 'comptable':
            route = '/comptable';
            break;
          case 'vigile':
            route = '/vigile';
            break;
          case 'etudiant':
            route = '/etudiant';
            break;
          default:
            route = '/login';
        }
        Navigator.of(context).pushReplacementNamed(route);
      } else {
        Navigator.of(context).pushReplacementNamed('/login');
      }
    } catch (e) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '🎓',
                style: TextStyle(fontSize: 80),
              ),
              SizedBox(height: AppSizes.lg),
              Text(
                'EduFlex',
                style: AppTextStyles.headingLarge.copyWith(
                  color: AppColors.white,
                ),
              ),
              SizedBox(height: AppSizes.md),
              CircularProgressIndicator(
                color: AppColors.white,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
