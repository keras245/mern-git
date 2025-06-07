import 'package:flutter/material.dart';
import '../screens/vigile/vigile_dashboard.dart';
import '../utils/constants.dart';

class VigileNavigator extends StatefulWidget {
  @override
  _VigileNavigatorState createState() => _VigileNavigatorState();
}

class _VigileNavigatorState extends State<VigileNavigator> {
  @override
  Widget build(BuildContext context) {
    return VigileScreen(); // Directement le dashboard complet
  }
}
