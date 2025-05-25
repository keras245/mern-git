import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import { motion } from "framer-motion";
import DisponibiliteProf from "../../components/admin/emploiDuTemps/DisponibiliteProf";
import ImportDonnees from "../../components/admin/emploiDuTemps/ImportDonnees";
import AttributionCours from "../../components/admin/emploiDuTemps/AttributionCours";
import ModificationEDT from "../../components/admin/emploiDuTemps/ModificationEDT";
import CreneauxLibres from "../../components/admin/emploiDuTemps/CreneauxLibres";

const EmploiDuTemps = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des Emplois du Temps
        </h1>
      </div>

      <Tabs defaultValue="disponibilite" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="disponibilite">
            Disponibilité des Professeurs
          </TabsTrigger>
          <TabsTrigger value="import">Import des Données</TabsTrigger>
          <TabsTrigger value="attribution">Attribution des Cours</TabsTrigger>
          <TabsTrigger value="modification">Modification EDT</TabsTrigger>
          <TabsTrigger value="creneaux">Créneaux Libres</TabsTrigger>
        </TabsList>

        <TabsContent value="disponibilite">
          <DisponibiliteProf />
        </TabsContent>

        <TabsContent value="import">
          <ImportDonnees />
        </TabsContent>

        <TabsContent value="attribution">
          <AttributionCours />
        </TabsContent>

        <TabsContent value="modification">
          <ModificationEDT />
        </TabsContent>

        <TabsContent value="creneaux">
          <CreneauxLibres />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmploiDuTemps;
