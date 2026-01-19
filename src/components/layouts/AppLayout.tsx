import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  CreditCard,
  Wrench,
  FileText,
  BarChart3,
  Menu,
  LogOut,
  User,
  Grid3x3,
  DoorOpen,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Home },
  { name: 'Vacancy', href: '/vacancy', icon: Grid3x3 },
  { name: 'Occupancy', href: '/occupancy', icon: DoorOpen },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Rent Payments', href: '/rent-payments', icon: CreditCard },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25 scale-[1.02]'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1'
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary-foreground rounded-r-full" />
            )}
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'bg-sidebar-primary-foreground/20' 
                : 'bg-sidebar-primary/10 group-hover:bg-sidebar-primary/20 group-hover:scale-110'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-medium">{item.name}</span>
            {!isActive && (
              <div className="absolute inset-0 rounded-xl bg-sidebar-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 bg-sidebar border-r border-sidebar-border/50 shrink-0 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-sidebar-border/50 bg-sidebar-primary/10">
            <Link to="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105">
              <div className="relative">
                <div className="absolute inset-0 bg-sidebar-primary rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative p-3 bg-sidebar-primary rounded-2xl shadow-lg">
                  <Building2 className="h-7 w-7 text-sidebar-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-xl text-sidebar-foreground">
                  Roomsaathi
                </h1>
                <p className="text-xs text-sidebar-foreground/70 font-medium">Property Management Pro</p>
              </div>
            </Link>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="mb-4">
              <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-4 mb-2">
                Main Menu
              </p>
              <NavLinks />
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-primary/5">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-primary/10 backdrop-blur-sm border border-sidebar-border/30 hover:bg-sidebar-primary/20 transition-all duration-300 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-sidebar-primary rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {(profile?.username || 'User') as string}
                </p>
                <p className="text-xs text-sidebar-foreground/70 capitalize flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {(profile?.role || 'owner') as string}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <LogOut className="h-4 w-4 text-sidebar-foreground/70" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-10 bg-gradient-to-r from-background via-background to-background/95 border-b border-border backdrop-blur-lg">
          <div className="flex items-center justify-between p-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <span className="font-bold text-foreground">Roomsaathi</span>
                <p className="text-xs text-muted-foreground">Property Management</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <p className="font-medium">{(profile?.username || 'User') as string}</p>
                    <p className="text-xs text-muted-foreground capitalize">{(profile?.role || 'owner') as string}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 bg-background">
                  <div className="flex flex-col h-full bg-sidebar">
                    <div className="p-6 border-b border-sidebar-border/50 bg-sidebar-primary/10">
                      <Link to="/" className="group flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-sidebar-primary rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
                          <div className="relative p-3 bg-sidebar-primary rounded-2xl shadow-lg">
                            <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
                          </div>
                        </div>
                        <div>
                          <h1 className="font-bold text-lg text-sidebar-foreground">Roomsaathi</h1>
                          <p className="text-xs text-sidebar-foreground/70">Property Management Pro</p>
                        </div>
                      </Link>
                    </div>
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-4 mb-2">
                          Main Menu
                        </p>
                        <NavLinks />
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block sticky top-0 z-10 bg-background border-b border-border">
          <div className="flex items-center justify-end px-6 py-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>{(profile?.username || 'User') as string}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <p className="font-medium">{(profile?.username || 'User') as string}</p>
                  <p className="text-xs text-muted-foreground capitalize">{(profile?.role || 'owner') as string}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 xl:p-6">{children}</main>
      </div>
    </div>
  );
}