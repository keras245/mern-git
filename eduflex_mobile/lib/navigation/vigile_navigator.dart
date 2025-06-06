import 'package:flutter/material.dart';
import '../screens/vigile/vigile_dashboard.dart';
import '../utils/constants.dart';

class VigileNavigator extends StatefulWidget {
  @override
  _VigileNavigatorState createState() => _VigileNavigatorState();
}

class _VigileNavigatorState extends State<VigileNavigator> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    VigileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        selectedItemColor: AppColors.vigile,
        unselectedItemColor: AppColors.gray400,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Accueil',
          ),
        ],
      ),
    );
  }
}
