class User {
  final String id;
  final String nom;
  final String prenom;
  final String email;
  final String type;

  User({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.email,
    required this.type,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      nom: json['nom'] ?? '',
      prenom: json['prenom'] ?? '',
      email: json['email'] ?? '',
      type: json['type'] ?? '',
    );
  }
}
