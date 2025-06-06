import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/etudiant.dart';
import '../models/comptable.dart';
import '../models/vigile.dart';

class ApiService {
  static const String baseUrl = 'http://192.168.18.245:3832/api';

  Future<Map<String, String>> get _headers async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ===== AUTHENTIFICATION =====

  // Login Étudiant
  Future<Map<String, dynamic>> loginEtudiant(
      String matricule, String motDePasse) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile/login/etudiant'),
      headers: await _headers,
      body: jsonEncode({
        'matricule': matricule,
        'mot_de_passe': motDePasse,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      // Sauvegarder le token et type d'utilisateur
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      await prefs.setString('user_type', 'etudiant');
      await prefs.setString('user_data', jsonEncode(data['user']));

      return data;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Erreur de connexion');
    }
  }

  // Login Comptable
  Future<Map<String, dynamic>> loginComptable(
      String email, String motDePasse) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile/login/comptable'),
      headers: await _headers,
      body: jsonEncode({
        'email': email,
        'mot_de_passe': motDePasse,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      await prefs.setString('user_type', 'comptable');
      await prefs.setString('user_data', jsonEncode(data['user']));

      return data;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Erreur de connexion');
    }
  }

  // Login Vigile
  Future<Map<String, dynamic>> loginVigile(
      String telephone, String codeAcces) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile/login/vigile'),
      headers: await _headers,
      body: jsonEncode({
        'telephone': telephone,
        'code_acces': codeAcces,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      await prefs.setString('user_type', 'vigile');
      await prefs.setString('user_data', jsonEncode(data['user']));

      return data;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Erreur de connexion');
    }
  }

  // ===== ÉTUDIANTS =====

  Future<List<Map<String, dynamic>>> getEtudiants() async {
    final response = await http.get(
      Uri.parse('$baseUrl/mobile/comptable/etudiants'),
      headers: await _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['etudiants']);
    } else {
      throw Exception('Erreur lors de la récupération des étudiants');
    }
  }

  // Enregistrer paiement
  Future<Map<String, dynamic>> enregistrerPaiement({
    required String etudiantId,
    required double montant,
    required String typePaiement,
    String? motif,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile/comptable/paiement'),
      headers: await _headers,
      body: jsonEncode({
        'etudiant_id': etudiantId,
        'montant': montant,
        'type_paiement': typePaiement,
        'motif': motif,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(
          error['message'] ?? 'Erreur lors de l\'enregistrement du paiement');
    }
  }

  // ===== COMPTABLES (CRUD) =====

  Future<List<Map<String, dynamic>>> getComptables() async {
    final response = await http.get(
      Uri.parse('$baseUrl/mobile/comptable/comptables'),
      headers: await _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['comptables']);
    } else {
      throw Exception('Erreur lors de la récupération des comptables');
    }
  }

  Future<Map<String, dynamic>> creerComptable({
    required String nom,
    required String prenom,
    required String email,
    required String telephone,
    required String motDePasse,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile/test/comptable'),
      headers: await _headers,
      body: jsonEncode({
        'nom': nom,
        'prenom': prenom,
        'email': email,
        'telephone': telephone,
        'mot_de_passe': motDePasse,
      }),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(
          error['message'] ?? 'Erreur lors de la création du comptable');
    }
  }

  Future<Map<String, dynamic>> modifierComptable({
    required String comptableId,
    required String nom,
    required String prenom,
    required String email,
    required String telephone,
    String? motDePasse,
  }) async {
    final body = {
      'nom': nom,
      'prenom': prenom,
      'email': email,
      'telephone': telephone,
    };

    if (motDePasse != null && motDePasse.isNotEmpty) {
      body['mot_de_passe'] = motDePasse;
    }

    final response = await http.put(
      Uri.parse('$baseUrl/mobile/comptable/comptable/$comptableId'),
      headers: await _headers,
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(
          error['message'] ?? 'Erreur lors de la modification du comptable');
    }
  }

  Future<void> supprimerComptable(String comptableId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/mobile/comptable/comptable/$comptableId'),
      headers: await _headers,
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(
          error['message'] ?? 'Erreur lors de la suppression du comptable');
    }
  }

  // ===== VIGILES (CRUD) =====

  Future<List<Map<String, dynamic>>> getVigiles() async {
    final response = await http.get(
      Uri.parse('$baseUrl/mobile/comptable/vigiles'),
      headers: await _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['vigiles']);
    } else {
      throw Exception('Erreur lors de la récupération des vigiles');
    }
  }

  Future<Map<String, dynamic>> creerVigile({
    required String nom,
    required String prenom,
    required String telephone,
    required String codeAcces,
    String? poste,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile/test/vigile'),
      headers: await _headers,
      body: jsonEncode({
        'nom': nom,
        'prenom': prenom,
        'telephone': telephone,
        'code_acces': codeAcces,
        'poste': poste ?? 'porte_principale',
      }),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(
          error['message'] ?? 'Erreur lors de la création du vigile');
    }
  }

  Future<Map<String, dynamic>> modifierVigile({
    required String vigileId,
    required String nom,
    required String prenom,
    required String telephone,
    String? codeAcces,
    String? poste,
  }) async {
    final body = {
      'nom': nom,
      'prenom': prenom,
      'telephone': telephone,
      'poste': poste ?? 'porte_principale',
    };

    if (codeAcces != null && codeAcces.isNotEmpty) {
      body['code_acces'] = codeAcces;
    }

    final response = await http.put(
      Uri.parse('$baseUrl/mobile/comptable/vigile/$vigileId'),
      headers: await _headers,
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(
          error['message'] ?? 'Erreur lors de la modification du vigile');
    }
  }

  Future<void> supprimerVigile(String vigileId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/mobile/comptable/vigile/$vigileId'),
      headers: await _headers,
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(
          error['message'] ?? 'Erreur lors de la suppression du vigile');
    }
  }

  // ===== VIGILE =====

  // Scanner QR Code
  Future<Map<String, dynamic>> scanQRCode(String qrCode) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile/vigile/scan-qr'),
      headers: await _headers,
      body: jsonEncode({
        'qr_code': qrCode,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Erreur lors du scan QR');
    }
  }

  // ===== UTILS =====

  // Test de connexion
  Future<bool> testConnection() async {
    try {
      final response = await http
          .get(
            Uri.parse('$baseUrl/mobile/comptable/etudiants'),
            headers: await _headers,
          )
          .timeout(Duration(seconds: 5));

      return response.statusCode == 200;
    } catch (e) {
      print('Erreur de connexion: $e');
      return false;
    }
  }

  // ===== VIGILE - HISTORIQUE =====

  Future<List<Map<String, dynamic>>> getHistoriqueAcces() async {
    final response = await http.get(
      Uri.parse('$baseUrl/mobile/vigile/historique'),
      headers: await _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['historique']);
    } else {
      throw Exception('Erreur lors de la récupération de l\'historique');
    }
  }
}
