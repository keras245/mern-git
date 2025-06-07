import 'package:flutter/material.dart';
import '../../utils/constants.dart';

/**Dernier commit sur git c'est l'ajout de la bonne deconnexion */

class VigileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Dashboard Vigile'),
        backgroundColor: AppColors.vigile,
        foregroundColor: AppColors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: AppColors.vigileGradient,
                borderRadius: BorderRadius.circular(50),
              ),
              child: Center(
                child: Text('🔍', style: TextStyle(fontSize: 40)),
              ),
            ),
            SizedBox(height: 20),
            Text(
              'Dashboard Vigile',
              style: AppTextStyles.headingMedium,
            ),
            Text(
              'Interface en cours de développement...',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
