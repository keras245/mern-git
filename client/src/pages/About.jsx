import { motion } from 'framer-motion';
import Footer from '../components/layout/Footer';

const About = () => {
  const values = [
    {
      icon: '🎯',
      title: 'Excellence académique',
      description: 'Nous nous engageons à maintenir les plus hauts standards d\'excellence dans l\'enseignement et la recherche.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: '💡',
      title: 'Innovation et créativité',
      description: 'Nous encourageons l\'innovation et la créativité pour préparer nos étudiants aux défis de demain.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: '🤝',
      title: 'Intégrité et éthique',
      description: 'Nous agissons avec intégrité et respectons les plus hautes normes éthiques dans toutes nos activités.',
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: '🌍',
      title: 'Collaboration et communauté',
      description: 'Nous favorisons la collaboration et construisons une communauté forte et inclusive.',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const stats = [
    { number: '15+', label: 'Années d\'expérience', icon: '📅' },
    { number: '2000+', label: 'Diplômés', icon: '🎓' },
    { number: '95%', label: 'Taux d\'insertion', icon: '💼' },
    { number: '50+', label: 'Partenaires', icon: '🤝' }
  ];

  const team = [
    {
      name: 'Dr. Mamadou Diallo',
      role: 'Chef de Département',
      description: 'Expert en systèmes d\'information avec plus de 20 ans d\'expérience dans l\'enseignement supérieur.',
      avatar: 'MD'
    },
    {
      name: 'Prof. Aissatou Keita',
      role: 'Responsable Pédagogique',
      description: 'Spécialiste en génie logiciel et méthodes agiles, passionnée par l\'innovation pédagogique.',
      avatar: 'AK'
    },
    {
      name: 'Dr. Ibrahima Camara',
      role: 'Coordinateur Technique',
      description: 'Expert en réseaux et sécurité informatique, responsable de l\'infrastructure technique.',
      avatar: 'IC'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <main className="flex-grow bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full opacity-10 blur-3xl"></div>
        </div>

        {/* Hero Section */}
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <span className="text-3xl">🏛️</span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                À propos de nous
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Découvrez l'histoire, la mission et les valeurs du Département de Génie Informatique 
                de l'Université Nongo Conakry, un établissement d'excellence au service de l'innovation technologique.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission et Vision */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Notre mission est de former les futurs leaders en informatique de la Guinée, en leur fournissant 
                  une éducation de qualité et les outils nécessaires pour réussir dans un monde numérique en constante évolution.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Nous nous engageons à maintenir les plus hauts standards d'excellence académique tout en favorisant 
                  l'innovation, la recherche et le développement technologique au service de notre communauté.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-2xl">🔮</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Vision</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Devenir le département de référence en Afrique de l'Ouest pour la formation en génie informatique, 
                  reconnu pour l'excellence de ses programmes et l'innovation de ses méthodes pédagogiques.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Nous aspirons à être un catalyseur de transformation numérique en Guinée, en formant des professionnels 
                  compétents et éthiques capables de relever les défis technologiques de demain.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Statistiques */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Notre Impact en Chiffres
              </h2>
              <p className="text-xl text-gray-600">Des résultats qui témoignent de notre engagement</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
                >
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nos Valeurs Fondamentales
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Les principes qui guident notre action quotidienne et façonnent notre identité
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <span className="text-2xl">{value.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Équipe */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Notre Équipe Dirigeante
              </h2>
              <p className="text-xl text-gray-600">Des experts passionnés au service de votre réussite</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 leading-relaxed text-sm">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Rejoignez Notre Communauté
              </h2>
              <p className="text-xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Découvrez comment notre département peut vous accompagner dans votre parcours académique et professionnel
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-blue-50"
                >
                  <span>Nous contacter</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;