import 'package:flutter/material.dart';

class AppColors {
  // Couleurs principales (cohérentes avec votre Tailwind)
  static const Color primary50 = Color(0xFFF0F9FF);
  static const Color primary100 = Color(0xFFE0F2FE);
  static const Color primary200 = Color(0xFFBAE6FD);
  static const Color primary300 = Color(0xFF7DD3FC);
  static const Color primary400 = Color(0xFF38BDF8);
  static const Color primary500 = Color(0xFF0EA5E9); // Votre couleur principale
  static const Color primary600 = Color(0xFF0284C7);
  static const Color primary700 = Color(0xFF0369A1);
  static const Color primary800 = Color(0xFF075985);
  static const Color primary900 = Color(0xFF0C4A6E);

  // Couleurs par rôle (comme dans votre web)
  static const Color comptable = Color(0xFF0EA5E9); // Bleu
  static const Color vigile = Color(0xFF10B981); // Vert émeraude
  static const Color etudiant = Color(0xFF8B5CF6); // Violet

  // Couleurs d'état
  static const Color success = Color(0xFF10B981);
  static const Color danger = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);

  // Couleurs neutres
  static const Color white = Color(0xFFFFFFFF);
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray700 = Color(0xFF374151);
  static const Color gray800 = Color(0xFF1F2937);
  static const Color gray900 = Color(0xFF111827);

  // Dégradés (comme dans votre design web)
  static const Gradient primaryGradient = LinearGradient(
    colors: [primary500, primary600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient comptableGradient = LinearGradient(
    colors: [Color(0xFF3B82F6), Color(0xFF6366F1)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient vigileGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient etudiantGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFF7C3AED)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppSizes {
  // Spacing (cohérent avec Tailwind)
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;

  // Font sizes
  static const double fontXs = 12.0;
  static const double fontSm = 14.0;
  static const double fontBase = 16.0;
  static const double fontLg = 18.0;
  static const double fontXl = 20.0;
  static const double font2Xl = 24.0;
  static const double font3Xl = 30.0;
  static const double font4Xl = 36.0;

  // Border radius
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 20.0;
  static const double radius2Xl = 24.0;
}

class AppTextStyles {
  static const TextStyle headingLarge = TextStyle(
    fontSize: AppSizes.font3Xl,
    fontWeight: FontWeight.bold,
    color: AppColors.gray900,
    height: 1.2,
  );

  static const TextStyle headingMedium = TextStyle(
    fontSize: AppSizes.font2Xl,
    fontWeight: FontWeight.bold,
    color: AppColors.gray900,
    height: 1.3,
  );

  static const TextStyle headingSmall = TextStyle(
    fontSize: AppSizes.fontXl,
    fontWeight: FontWeight.w600,
    color: AppColors.gray900,
    height: 1.4,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontSize: AppSizes.fontLg,
    color: AppColors.gray700,
    height: 1.5,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontSize: AppSizes.fontBase,
    color: AppColors.gray600,
    height: 1.5,
  );

  static const TextStyle bodySmall = TextStyle(
    fontSize: AppSizes.fontSm,
    color: AppColors.gray500,
    height: 1.4,
  );

  static const TextStyle labelMedium = TextStyle(
    fontSize: AppSizes.fontSm,
    fontWeight: FontWeight.w600,
    color: AppColors.gray700,
  );
}
