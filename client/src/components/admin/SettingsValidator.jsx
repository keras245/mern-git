import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function SettingsValidator({ 
  data, 
  rules, 
  onValidationChange,
  showValidation = true 
}) {
  const [validationResults, setValidationResults] = useState({});
  const [isValid, setIsValid] = useState(true);

  // Règles de validation par défaut
  const defaultRules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Adresse email invalide'
    },
    phone: {
      pattern: /^[\+]?[0-9\s\-\(\)]{10,}$/,
      message: 'Numéro de téléphone invalide'
    },
    password: {
      minLength: 6,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule et un chiffre'
    },
    url: {
      pattern: /^https?:\/\/.+/,
      message: 'URL invalide (doit commencer par http:// ou https://)'
    },
    ip: {
      pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      message: 'Adresse IP invalide'
    }
  };

  const validateField = (fieldName, value, rule) => {
    const errors = [];
    const warnings = [];
    const infos = [];

    // Vérifier si requis
    if (rule.required && (!value || value.trim() === '')) {
      errors.push('Ce champ est requis');
    }

    // Si pas de valeur et pas requis, pas besoin de valider plus
    if (!value || value.trim() === '') {
      return { errors, warnings, infos, isValid: !rule.required };
    }

    // Vérifier la longueur minimale
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(`Minimum ${rule.minLength} caractères requis`);
    }

    // Vérifier la longueur maximale
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(`Maximum ${rule.maxLength} caractères autorisés`);
    }

    // Vérifier le pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || 'Format invalide');
    }

    // Validations personnalisées
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult.errors) errors.push(...customResult.errors);
      if (customResult.warnings) warnings.push(...customResult.warnings);
      if (customResult.infos) infos.push(...customResult.infos);
    }

    // Suggestions et avertissements spéciaux
    if (fieldName === 'password') {
      if (value.length < 8) {
        warnings.push('Un mot de passe plus long est recommandé');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        infos.push('Ajoutez des caractères spéciaux pour plus de sécurité');
      }
    }

    if (fieldName === 'email' && value.includes('+')) {
      infos.push('Email avec alias détecté');
    }

    return {
      errors,
      warnings,
      infos,
      isValid: errors.length === 0
    };
  };

  useEffect(() => {
    const results = {};
    let overallValid = true;

    // Combiner les règles par défaut avec les règles personnalisées
    const allRules = { ...defaultRules, ...rules };

    Object.entries(data).forEach(([fieldName, value]) => {
      if (allRules[fieldName]) {
        const result = validateField(fieldName, value, allRules[fieldName]);
        results[fieldName] = result;
        if (!result.isValid) {
          overallValid = false;
        }
      }
    });

    setValidationResults(results);
    setIsValid(overallValid);

    if (onValidationChange) {
      onValidationChange({
        isValid: overallValid,
        results
      });
    }
  }, [data, rules, onValidationChange]);

  const getFieldStatus = (fieldName) => {
    const result = validationResults[fieldName];
    if (!result) return 'neutral';
    
    if (result.errors.length > 0) return 'error';
    if (result.warnings.length > 0) return 'warning';
    if (result.infos.length > 0) return 'info';
    return 'success';
  };

  const getFieldIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return null;
    }
  };

  const getFieldColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  if (!showValidation) return null;

  return (
    <div className="space-y-2">
      {Object.entries(validationResults).map(([fieldName, result]) => {
        const status = getFieldStatus(fieldName);
        const Icon = getFieldIcon(status);
        const colorClass = getFieldColor(status);
        
        if (status === 'neutral' || (!result.errors.length && !result.warnings.length && !result.infos.length)) {
          return null;
        }

        return (
          <AnimatePresence key={fieldName}>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={`flex items-start space-x-2 p-3 rounded-lg border ${
                status === 'error' ? 'bg-red-50 border-red-200' :
                status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                status === 'info' ? 'bg-blue-50 border-blue-200' :
                'bg-green-50 border-green-200'
              }`}>
                {Icon && <Icon size={16} className={`mt-0.5 ${colorClass}`} />}
                
                <div className="flex-1 text-sm">
                  <div className="font-medium capitalize mb-1">{fieldName}</div>
                  
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-red-700">• {error}</div>
                  ))}
                  
                  {result.warnings.map((warning, index) => (
                    <div key={index} className="text-yellow-700">• {warning}</div>
                  ))}
                  
                  {result.infos.map((info, index) => (
                    <div key={index} className="text-blue-700">• {info}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      })}

      {/* Résumé de validation global */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center space-x-2 p-3 rounded-lg border text-sm font-medium ${
          isValid 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        {isValid ? (
          <>
            <CheckCircle size={16} />
            <span>Tous les champs sont valides</span>
          </>
        ) : (
          <>
            <AlertCircle size={16} />
            <span>Certains champs nécessitent votre attention</span>
          </>
        )}
      </motion.div>
    </div>
  );
} 