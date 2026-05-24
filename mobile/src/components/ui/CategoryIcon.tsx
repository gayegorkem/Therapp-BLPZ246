import {
  Activity,
  CloudRain,
  Heart,
  HelpCircle,
  Leaf,
  Moon,
  User,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from '@/theme';

const iconMap: Record<string, LucideIcon> = {
  wind: Wind,
  'cloud-rain': CloudRain,
  zap: Zap,
  user: User,
  activity: Activity,
  heart: Heart,
  leaf: Leaf,
  moon: Moon,
};

type Props = {
  name: string;
  size?: number;
  color?: string;
};

export function CategoryIcon({ name, size = 24, color = colors.primaryDark }: Props) {
  const Icon = iconMap[name] ?? HelpCircle;
  return <Icon size={size} color={color} strokeWidth={1.8} />;
}
