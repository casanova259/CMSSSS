import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color, trend }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      {change && trend && (
        <div className={`flex items-center text-sm ${trendColor}`}>
          <TrendIcon size={16} className="mr-1" />
          <span>{change}%</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
