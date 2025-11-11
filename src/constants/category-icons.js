import { Users, MapPin, Shield, Flag, Book, Sparkles, Swords, Globe } from 'lucide-react';

/**
 * Available Category Icons
 * 
 * These are the valid icon identifiers that can be used for categories.
 * Backend should only accept these values when creating/updating categories.
 * Frontend uses these to render the appropriate icon component.
 */

export const AVAILABLE_ICONS = [
  { id: 'users', label: 'شخصيات', component: Users },
  { id: 'map-pin', label: 'أماكن', component: MapPin },
  { id: 'shield', label: 'دروع / أشياء', component: Shield },
  { id: 'flag', label: 'فصائل', component: Flag },
  { id: 'book', label: 'كتب', component: Book },
  { id: 'sparkles', label: 'سحر', component: Sparkles },
  { id: 'swords', label: 'أسلحة', component: Swords },
  { id: 'globe', label: 'عوالم', component: Globe },
];

/**
 * Icon ID to Component mapping
 * Used to quickly get the icon component from backend icon ID
 */
export const ICON_COMPONENTS = {
  'users': Users,
  'map-pin': MapPin,
  'mappin': MapPin, // Alternative format
  'shield': Shield,
  'flag': Flag,
  'book': Book,
  'sparkles': Sparkles,
  'swords': Swords,
  'globe': Globe,
};

/**
 * Valid icon IDs (for validation)
 * Backend should validate that icon field matches one of these
 */
export const VALID_ICON_IDS = [
  'users',
  'map-pin',
  'shield',
  'flag',
  'book',
  'sparkles',
  'swords',
  'globe',
];

/**
 * Default icon to use if invalid icon is provided
 */
export const DEFAULT_ICON = 'users';
export const DEFAULT_ICON_COMPONENT = Users;
