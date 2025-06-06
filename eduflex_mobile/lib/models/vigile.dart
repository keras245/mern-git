class Vigile {
  final String id;
  final String nom;
  final String prenom;
  final String telephone;
  final String poste;
  final String statut;

  Vigile({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.telephone,
    required this.poste,
    required this.statut,
  });

  factory Vigile.fromJson(Map<String, dynamic> json) {
    return Vigile(
      id: json['_id'] ?? json['id'] ?? '',
      nom: json['nom'] ?? '',
      prenom: json['prenom'] ?? '',
      telephone: json['telephone'] ?? '',
      poste: json['poste'] ?? 'porte_principale',
      statut: json['statut'] ?? 'actif',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom': nom,
      'prenom': prenom,
      'telephone': telephone,
      'poste': poste,
      'statut': statut,
    };
  }
}
