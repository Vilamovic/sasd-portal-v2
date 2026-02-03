import {
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  LogIn,
  User,
  Shield,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  Maximize2,
  Minimize2,
  AlertCircle,
  Info,
  Archive,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Mail,
  AtSign,
  Hash,
  CheckSquare,
  Square,
  Circle,
  Disc,
} from 'lucide-react';

/**
 * Mapowanie nazw ikon (string) na komponenty Lucide React
 * Używane w całej aplikacji do dynamicznego renderowania ikon
 */
export const iconMap = {
  // Nawigacja
  home: Home,
  bookOpen: BookOpen,
  fileText: FileText,
  clipboardList: ClipboardList,
  users: Users,
  settings: Settings,
  menu: Menu,

  // Autentykacja
  logOut: LogOut,
  logIn: LogIn,
  user: User,
  shield: Shield,

  // Egzaminy
  award: Award,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  clock: Clock,
  archive: Archive,

  // Akcje
  search: Search,
  plus: Plus,
  edit: Edit,
  trash2: Trash2,
  save: Save,
  x: X,
  eye: Eye,
  eyeOff: EyeOff,
  download: Download,
  upload: Upload,
  refreshCw: RefreshCw,

  // Nawigacja / UI
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  maximize2: Maximize2,
  minimize2: Minimize2,

  // Notyfikacje
  alertCircle: AlertCircle,
  info: Info,

  // Filtrowanie / Sortowanie
  filter: Filter,
  sortAsc: SortAsc,
  sortDesc: SortDesc,

  // Inne
  calendar: Calendar,
  mail: Mail,
  atSign: AtSign,
  hash: Hash,

  // Checkboxy / Radio
  checkSquare: CheckSquare,
  square: Square,
  circle: Circle,
  disc: Disc,
};

/**
 * Komponent pomocniczy do renderowania ikony po nazwie
 * @param {string} name - Nazwa ikony z iconMap
 * @param {object} props - Props przekazywane do komponentu ikony (size, color, className, etc.)
 */
export const Icon = ({ name, ...props }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return <IconComponent {...props} />;
};
