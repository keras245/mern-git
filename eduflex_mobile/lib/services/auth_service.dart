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
      print('Erreur getCurrentUser: $e');
      return null;
    }
  }

  // Vérifier l'état d'authentification au démarrage
  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final userType = prefs.getString('user_type');
      final userData = prefs.getString('user_data');

      if (token != null && userType != null && userData != null) {
        // Vérifier si le token est toujours valide
        final isConnected = await _apiService.testConnection();
        if (isConnected) {
          _isAuthenticated = true;
          _userType = userType;

          // Charger les données utilisateur selon le type
          final userJson = jsonDecode(userData);
          switch (userType) {
            case 'etudiant':
              _etudiant = Etudiant.fromJson(userJson);
              break;
            case 'comptable':
              _comptable = Comptable.fromJson(userJson);
              break;
            case 'vigile':
              _vigile = Vigile.fromJson(userJson);
              break;
          }
        }
      }
    } catch (e) {
      print('Erreur lors de la vérification d\'authentification: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  // Connexion Étudiant
  Future<bool> loginEtudiant(String matricule, String motDePasse) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.loginEtudiant(matricule, motDePasse);

      // ✅ AJOUT : Sauvegarder les données utilisateur
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', response['token']);
      await prefs.setString('user_type', 'etudiant');
      await prefs.setString('user_data', jsonEncode(response['user']));

      _etudiant = Etudiant.fromJson(response['user']);
      _isAuthenticated = true;
      _userType = 'etudiant';

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  // Connexion Comptable
  Future<bool> loginComptable(String email, String motDePasse) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.loginComptable(email, motDePasse);

      // ✅ AJOUT : Sauvegarder les données utilisateur
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', response['token']);
      await prefs.setString('user_type', 'comptable');
      await prefs.setString('user_data', jsonEncode(response['user']));

      _comptable = Comptable.fromJson(response['user']);
      _isAuthenticated = true;
      _userType = 'comptable';

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  // Connexion Vigile
  Future<bool> loginVigile(String telephone, String codeAcces) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.loginVigile(telephone, codeAcces);

      // ✅ AJOUT : Sauvegarder les données utilisateur
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', response['token']);
      await prefs.setString('user_type', 'vigile');
      await prefs.setString('user_data', jsonEncode(response['user']));

      _vigile = Vigile.fromJson(response['user']);
      _isAuthenticated = true;
      _userType = 'vigile';

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  // Déconnexion
  Future<void> logout() async {
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
  }
}
