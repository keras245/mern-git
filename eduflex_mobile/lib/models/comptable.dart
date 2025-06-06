class Comptable {
  final String id;
  final String idComptable;
  final String nom;
  final String prenom;
  final String email;
  final String telephone;
  final String statut;

  Comptable({
    required this.id,
    required this.idComptable,
    required this.nom,
    required this.prenom,
    required this.email,
    required this.telephone,
    required this.statut,
  });

  factory Comptable.fromJson(Map<String, dynamic> json) {
    return Comptable(
      id: json['_id'] ?? json['id'] ?? '',
      idComptable: json['id_comptable'] ?? '',
      nom: json['nom'] ?? '',
      prenom: json['prenom'] ?? '',
      email: json['email'] ?? '',
      telephone: json['telephone'] ?? '',
      statut: json['statut'] ?? 'actif',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'id_comptable': idComptable,
      'nom': nom,
      'prenom': prenom,
      'email': email,
      'telephone': telephone,
      'statut': statut,
    };
  }
}
