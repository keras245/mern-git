class Etudiant {
  final String id;
  final String matricule;
  final String nom;
  final String prenom;
  final String email;
  final String telephone;
  final String qrCode;
  final String statutCompte;
  final Programme? programme;
  final int groupe;
  final DateTime? derniereEntreeFac;

  Etudiant({
    required this.id,
    required this.matricule,
    required this.nom,
    required this.prenom,
    required this.email,
    required this.telephone,
    required this.qrCode,
    required this.statutCompte,
    this.programme,
    required this.groupe,
    this.derniereEntreeFac,
  });

  factory Etudiant.fromJson(Map<String, dynamic> json) {
    return Etudiant(
      id: json['_id'] ?? json['id'] ?? '',
      matricule: json['matricule'] ?? '',
      nom: json['nom'] ?? '',
      prenom: json['prenom'] ?? '',
      email: json['email'] ?? '',
      telephone: json['telephone'] ?? '',
      qrCode: json['qr_code'] ?? '',
      statutCompte: json['statut_compte'] ?? 'en_attente',
      programme: json['programme_id'] != null
          ? Programme.fromJson(json['programme_id'])
          : null,
      groupe: json['groupe'] ?? 1,
      derniereEntreeFac: json['derniere_entree_fac'] != null
          ? DateTime.parse(json['derniere_entree_fac'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'matricule': matricule,
      'nom': nom,
      'prenom': prenom,
      'email': email,
      'telephone': telephone,
      'qr_code': qrCode,
      'statut_compte': statutCompte,
      'programme_id': programme?.toJson(),
      'groupe': groupe,
      'derniere_entree_fac': derniereEntreeFac?.toIso8601String(),
    };
  }
}

class Programme {
  final String id;
  final String nom;
  final String licence;
  final int semestre;

  Programme({
    required this.id,
    required this.nom,
    required this.licence,
    required this.semestre,
  });

  factory Programme.fromJson(Map<String, dynamic> json) {
    return Programme(
      id: json['_id'] ?? json['id'] ?? '',
      nom: json['nom'] ?? '',
      licence: json['licence'] ?? '',
      semestre: json['semestre'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom': nom,
      'licence': licence,
      'semestre': semestre,
    };
  }
}
