import 'package:flutter/material.dart';
import '../screens/etudiant/etudiant_dashboard.dart';
import '../screens/etudiant/emploi_du_temps_screen.dart';
import '../screens/etudiant/qr_code_screen.dart';
import '../screens/etudiant/demande_presence_screen.dart';
import '../screens/etudiant/profil_etudiant_screen.dart';
import '../utils/constants.dart';

class EtudiantNavigator extends StatefulWidget {
  @override
  _EtudiantNavigatorState createState() => _EtudiantNavigatorState();
}

class _EtudiantNavigatorState extends State<EtudiantNavigator> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    EtudiantDashboard(),
    EmploiDuTempsScreen(),
    QRCodeScreen(),
    DemandePresenceScreen(),
    ProfilEtudiantScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        selectedItemColor: AppColors.etudiant,
        unselectedItemColor: AppColors.gray400,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.schedule),
            label: 'Emploi du temps',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code),
            label: 'QR Code',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.check_circle),
            label: 'Présence',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}
