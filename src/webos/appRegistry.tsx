import type { LucideIcon } from 'lucide-react';
import { AppWindow, Calculator, CalendarDays, FilePenLine, FolderOpen, Globe2, MonitorCog, NotebookPen, PackageOpen, Settings2, Sparkles, TerminalSquare } from 'lucide-react';
import type { AppId } from './types';

export interface AppDescriptor {
  id: AppId;
  title: string;
  shortTitle: string;
  description: string;
  category: 'productivity' | 'system' | 'internet';
  icon: LucideIcon;
}

export const APP_REGISTRY: AppDescriptor[] = [
  { id: 'file-manager', title: 'File Manager', shortTitle: 'Files', description: 'Browse your isolated virtual disk.', category: 'system', icon: FolderOpen },
  { id: 'terminal', title: 'Terminal', shortTitle: 'Terminal', description: 'Run commands against the virtual filesystem.', category: 'system', icon: TerminalSquare },
  { id: 'editor', title: 'Text Editor', shortTitle: 'Editor', description: 'Edit and save text or code files.', category: 'productivity', icon: FilePenLine },
  { id: 'browser', title: 'Web Browser', shortTitle: 'Browser', description: 'Browse safe internal pages and open external sites.', category: 'internet', icon: Globe2 },
  { id: 'calculator', title: 'Calculator', shortTitle: 'Calculator', description: 'Calculate with keyboard-friendly controls.', category: 'productivity', icon: Calculator },
  { id: 'notes', title: 'Notes', shortTitle: 'Notes', description: 'Keep a quick local scratchpad.', category: 'productivity', icon: NotebookPen },
  { id: 'calendar', title: 'Calendar', shortTitle: 'Calendar', description: 'See the current month and session date.', category: 'productivity', icon: CalendarDays },
  { id: 'monitor', title: 'System Monitor', shortTitle: 'Monitor', description: 'Inspect simulated processes and storage.', category: 'system', icon: MonitorCog },
  { id: 'settings', title: 'Settings', shortTitle: 'Settings', description: 'Change the virtual computer preferences.', category: 'system', icon: Settings2 },
  { id: 'store', title: 'Application Store', shortTitle: 'Store', description: 'Discover applications available in WebOS.', category: 'system', icon: PackageOpen },
  { id: 'research', title: 'AUGMENT Workspace', shortTitle: 'AUGMENT', description: 'Open the existing source-grounded research workspace.', category: 'productivity', icon: Sparkles },
];

export const getApp = (id: AppId) => APP_REGISTRY.find((app) => app.id === id) || APP_REGISTRY[0];

export const desktopAppIds: AppId[] = ['file-manager', 'terminal', 'editor', 'browser', 'calculator', 'settings'];

export const isAppId = (value: string): value is AppId => APP_REGISTRY.some((app) => app.id === value);

export const AppIcon = ({ appId, size = 18 }: { appId: AppId; size?: number }) => {
  const Icon = getApp(appId).icon || AppWindow;
  return <Icon size={size} strokeWidth={1.8} />;
};
