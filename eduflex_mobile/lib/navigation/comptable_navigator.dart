import 'package:flutter/material.dart';
import '../screens/comptable/comptable_dashboard.dart';
import '../utils/constants.dart';

class ComptableNavigator extends StatefulWidget {
  @override
  _ComptableNavigatorState createState() => _ComptableNavigatorState();
}

class _ComptableNavigatorState extends State<ComptableNavigator> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    ComptableDashboard(),
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
        selectedItemColor: AppColors.comptable,
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
