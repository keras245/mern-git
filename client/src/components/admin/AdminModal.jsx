import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import bcrypt from 'bcryptjs';

const AdminModal = ({ admin, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id_admin: '',
    nom: '',
    prenom: '',
    adresse: '',
    telephone: '',
    email: '',
    mot_de_passe: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (admin) {
      setFormData({
        id_admin: admin.id_admin || '',
        nom: admin.nom || '',
        prenom: admin.prenom || '',
        adresse: admin.adresse || '',
        email: admin.email || '',
        telephone: admin.telephone || '',
        mot_de_passe: ''
      });
    }
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const dataToSend = { ...formData };
      if (!admin || (admin && formData.mot_de_passe)) {
        const salt = await bcrypt.genSalt(10);
        dataToSend.mot_de_passe = await bcrypt.hash(formData.mot_de_passe, salt);
      } else {
        delete dataToSend.mot_de_passe;
      }

      if (admin) {
        await axios.put(
          `http://localhost:3832/api/administrateurs/${admin._id}`,
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        showNotification('Administrateur modifié avec succès', 'success');
      } else {
        await axios.post(
          'http://localhost:3832/api/administrateurs/creer',
          dataToSend,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        showNotification('Administrateur créé avec succès', 'success');
      }
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      showNotification(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {admin ? 'Modifier' : 'Ajouter'} un administrateur
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">ID Admin</label>
            <input
              type="text"
              value={formData.id_admin}
              onChange={(e) => setFormData({ ...formData, id_admin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">Prénom</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-800 mb-2 block">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-bold text-gray-800 mb-2 block">
              Mot de passe {admin && '(requis pour modification)'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.mot_de_passe}
                onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {admin ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>

      </div>
    </motion.div>
  );
};

export default AdminModal; 