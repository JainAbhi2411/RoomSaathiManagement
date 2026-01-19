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
  { name: 'Payments', href: '/payments', icon: CreditCard },
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
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-sidebar border-r border-sidebar-border shrink-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-sidebar-primary rounded-xl shadow-lg">
                <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground">Roomsaathi</h1>
                <p className="text-xs text-sidebar-foreground/70">Property Management</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <NavLinks />
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-4 w-4 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {(profile?.username || 'User') as string}
                </p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">{(profile?.role || 'owner') as string}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-10 bg-background border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-xl shadow-lg">
                <Building2 className="h-5 w-5 text-primary-foreground" />
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
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-border">
                      <Link to="/" className="flex items-center gap-2">
                        <div className="p-2 bg-primary rounded-xl shadow-lg">
                          <Building2 className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h1 className="font-bold">Roomsaathi</h1>
                          <p className="text-xs text-muted-foreground">Property Management</p>
                        </div>
                      </Link>
                    </div>
                    <nav className="flex-1 p-4 space-y-1">
                      <NavLinks />
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