import 'package:flutter/material.dart';
import '../screens/comptable/comptable_dashboard.dart';
import '../utils/constants.dart';

class ComptableNavigator extends StatefulWidget {
  @override
  _ComptableNavigatorState createState() => _ComptableNavigatorState();
}

class _ComptableNavigatorState extends State<ComptableNavigator> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return ComptableDashboard();
  }
}
