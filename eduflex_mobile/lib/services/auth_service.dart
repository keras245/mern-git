import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/etudiant.dart';
import '../models/comptable.dart';
import '../models/vigile.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  // État d'authentification
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _userType;

  // Utilisateurs selon le type
  Etudiant? _etudiant;
  Comptable? _comptable;
  Vigile? _vigile;

  final ApiService _apiService = ApiService();

  // ✅ CONSTRUCTEUR SIMPLE - PAS DE VÉRIFICATION AUTO
  AuthService() {
    print('🔧 [AUTH] Service initialisé');
  }

  // Getters
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get userType => _userType;
  Etudiant? get etudiant => _etudiant;
  Comptable? get comptable => _comptable;
  Vigile? get vigile => _vigile;

  // Récupérer l'utilisateur actuel selon le type
  dynamic get currentUser {
    switch (_userType) {
      case 'etudiant':
        return _etudiant;
      case 'comptable':
        return _comptable;
      case 'vigile':
        return _vigile;
      default:
        return null;
    }
  }

  // ✅ FONCTION OPTIONNELLE pour vérifier une session existante (si besoin)
  Future<bool> hasExistingSession() async {
    try {
      print('🔍 [AUTH_SERVICE] Vérification session existante...');

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final userType = prefs.getString('user_type');
      final userData = prefs.getString('user_data');

      print('📝 [AUTH_SERVICE] Token: ${token != null ? 'Présent' : 'Absent'}');
      print('📝 [AUTH_SERVICE] UserType: $userType');

      if (token != null && userType != null && userData != null) {
        print('✅ [AUTH_SERVICE] Session trouvée - Type: $userType');

        // Tenter de restaurer la session
        try {
          _isAuthenticated = true;
          _userType = userType;

          final userJson = jsonDecode(userData);
          switch (userType) {
            case 'etudiant':
              _etudiant = Etudiant.fromJson(userJson);
              print(
                  '👨‍🎓 [AUTH_SERVICE] Étudiant restauré: ${_etudiant?.nom}');
              break;
            case 'comptable':
              _comptable = Comptable.fromJson(userJson);
              print('💰 [AUTH_SERVICE] Comptable restauré: ${_comptable?.nom}');
              break;
            case 'vigile':
              _vigile = Vigile.fromJson(userJson);
              print('🛡️ [AUTH_SERVICE] Vigile restauré: ${_vigile?.nom}');
              break;
          }

          notifyListeners();
          return true;
        } catch (e) {
          print('❌ [AUTH_SERVICE] Erreur restauration session: $e');
          await _clearAuthData();
          return false;
        }
      }

      print('❌ [AUTH_SERVICE] Aucune session existante');
      return false;
    } catch (e) {
      print('❌ [AUTH_SERVICE] Erreur vérification session: $e');
      return false;
    }
  }

  // Vérifier l'état d'authentification (optionnel)
  Future<void> checkAuthStatus() async {
    print('🔄 [AUTH_SERVICE] Vérification forcée de l\'état...');

    _isLoading = true;
    notifyListeners();

    try {
      final hasSession = await hasExistingSession();
      print('📊 [AUTH_SERVICE] Session existante: $hasSession');
    } catch (e) {
      print('❌ [AUTH_SERVICE] Erreur checkAuthStatus: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // ✅ FONCTION pour nettoyer les données d'auth
  Future<void> _clearAuthData() async {
    print('🧹 [AUTH_SERVICE] Nettoyage des données...');

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user_type');
    await prefs.remove('user_data');

    _etudiant = null;
    _comptable = null;
    _vigile = null;
    _isAuthenticated = false;
    _userType = null;

    print('✅ [AUTH_SERVICE] Données nettoyées');
  }

  // Connexion Étudiant
  Future<bool> loginEtudiant(String matricule, String motDePasse) async {
    print('🔄 [AUTH] Login étudiant: $matricule');

    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.loginEtudiant(matricule, motDePasse);
      print('✅ [AUTH] API réponse OK');

      // Sauvegarder
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', response['token']);
      await prefs.setString('user_type', 'etudiant');
      await prefs.setString('user_data', jsonEncode(response['user']));

      _etudiant = Etudiant.fromJson(response['user']);
      _isAuthenticated = true;
      _userType = 'etudiant';

      _isLoading = false;
      notifyListeners();

      print('🎉 [AUTH] Étudiant connecté: ${_etudiant?.nom}');
      return true;
    } catch (e) {
      print('❌ [AUTH] Erreur login étudiant: $e');
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  // Connexion Comptable
  Future<bool> loginComptable(String email, String motDePasse) async {
    print('🔄 [AUTH] Login comptable: $email');

    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.loginComptable(email, motDePasse);
      print('✅ [AUTH] API réponse OK');

      // Sauvegarder
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', response['token']);
      await prefs.setString('user_type', 'comptable');
      await prefs.setString('user_data', jsonEncode(response['user']));

      _comptable = Comptable.fromJson(response['user']);
      _isAuthenticated = true;
      _userType = 'comptable';

      _isLoading = false;
      notifyListeners();

      print('🎉 [AUTH] Comptable connecté: ${_comptable?.nom}');
      return true;
    } catch (e) {
      print('❌ [AUTH] Erreur login comptable: $e');
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  // Connexion Vigile
  Future<bool> loginVigile(String telephone, String codeAcces) async {
    print('🔄 [AUTH] Login vigile: $telephone');

    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.loginVigile(telephone, codeAcces);
      print('✅ [AUTH] API réponse OK');

      // Sauvegarder
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', response['token']);
      await prefs.setString('user_type', 'vigile');
      await prefs.setString('user_data', jsonEncode(response['user']));

      _vigile = Vigile.fromJson(response['user']);
      _isAuthenticated = true;
      _userType = 'vigile';

      _isLoading = false;
      notifyListeners();

      print('🎉 [AUTH] Vigile connecté: ${_vigile?.nom}');
      return true;
    } catch (e) {
      print('❌ [AUTH] Erreur login vigile: $e');
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  // Déconnexion
  Future<void> logout() async {
    print('🔄 [AUTH] Déconnexion');

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user_type');
    await prefs.remove('user_data');

    _etudiant = null;
    _comptable = null;
    _vigile = null;
    _isAuthenticated = false;
    _userType = null;

    notifyListeners();
    print('✅ [AUTH] Déconnecté');
  }

  // ✅ AJOUT : Fonction statique pour récupérer l'utilisateur actuel
  static Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final userType = prefs.getString('user_type');
      final userData = prefs.getString('user_data');

      if (token != null && userType != null && userData != null) {
        final userJson = jsonDecode(userData);
        userJson['type'] = userType;
        return userJson;
      }
      return null;
    } catch (e) {
      print('❌ [AUTH_SERVICE] Erreur getCurrentUser: $e');
      return null;
    }
  }
}
