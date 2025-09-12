
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode; // Reintroducing the optional icon for the card
  backgroundImage?: string; // Add new prop for background image
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon, backgroundImage }) => {
  const cardStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: 'transparent', // Añadir esto para asegurar que el fondo no sea opaco
  } : {};

  const textColorClass = backgroundImage ? 'text-[#4b5563]' : 'text-gray-700 dark:text-gray-200';
  const valueColorClass = backgroundImage ? 'text-[#4b5563]' : 'text-gray-900 dark:text-white';
  const descriptionColorClass = backgroundImage ? 'text-[#4b5563]' : 'text-gray-500 dark:text-gray-400';

  const cardClasses = backgroundImage ? "bg-cover bg-center bg-no-repeat" : "bg-yellow-500 dark:bg-gray-800";

  return (
    <div className={`shadow rounded-lg p-6 flex items-center justify-between ${cardClasses}`} style={cardStyle}>
      <div>
        <h3 className={`text-lg font-semibold ${textColorClass}`}>{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${valueColorClass}`}>{value}</p>
        {description && <p className={`text-sm mt-1 ${descriptionColorClass}`}>{description}</p>}
      </div>
      {icon && <div className="text-white text-5xl">{icon}</div>}
    </div>
  );
};

export default MetricCard;
