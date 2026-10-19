import { LayoutDashboard, Library, Upload, FolderOpen, Bookmark, Trophy, Bell, User, Settings } from 'lucide-react';
export const studentNav = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/materials', label: 'Material Hub', icon: Library },
  { to: '/app/upload', label: 'Upload Material', icon: Upload },
  { to: '/app/my-uploads', label: 'My Uploads', icon: FolderOpen },
  { to: '/app/saved', label: 'Saved Materials', icon: Bookmark },
  { to: '/app/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/profile', label: 'My Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];
export const mobileNav = ['/app/dashboard', '/app/materials', '/app/upload', '/app/saved', '/app/profile'].map((p) => studentNav.find((n) => n.to === p));

