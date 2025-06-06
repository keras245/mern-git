import 'package:flutter/material.dart';
import '../../utils/constants.dart';

class EtudiantDashboard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Dashboard Étudiant'),
        backgroundColor: AppColors.etudiant,
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
                gradient: AppColors.etudiantGradient,
                borderRadius: BorderRadius.circular(50),
              ),
              child: Center(
                child: Text('🎓', style: TextStyle(fontSize: 40)),
              ),
            ),
            SizedBox(height: 20),
            Text(
              'Dashboard Étudiant',
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
