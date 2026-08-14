import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  // Try to find the icon by name or fallback to Tag
  const IconComponent = (Icons as any)[name] || Icons.Tag;
  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'Utensils',
  'ShoppingCart',
  'Car',
  'Home',
  'Zap',
  'Film',
  'HeartPulse',
  'ShoppingBag',
  'Plane',
  'BookOpen',
  'Coffee',
  'Smartphone',
  'Gift',
  'Briefcase',
  'Dumbbell',
  'DollarSign',
  'Tag',
  'Laptop',
  'Wifi',
  'Music'
];

export const AVAILABLE_COLORS = [
  '#7A8471', // Sage Green
  '#D68C70', // Terracotta
  '#B19F86', // Warm Sand
  '#5C6B50', // Deep Olive
  '#C47D63', // Warm Clay
  '#C2955B', // Golden Ochre
  '#6A7B82', // Slate Mist
  '#8A8A82', // Warm Taupe
  '#B55D42', // Muted Brick
  '#7D6664', // Earth Plum
  '#D99B5C', // Amber Honey
  '#6E7A68'  // Soft Moss
];
