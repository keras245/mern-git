import { Outlet } from 'react-router-dom';

const ProfLayout = () => {
  return (
    <div>
      {/* Ajoutez ici la navigation/sidebar du professeur si nécessaire */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ProfLayout; 