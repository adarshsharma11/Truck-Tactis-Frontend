import { Link, useLocation } from 'react-router-dom';
import { Calendar, Package, Activity, BarChart3 } from 'lucide-react';
import { DatePicker } from './DatePicker';

const tabs = [
  { path: '/plan', label: 'Day Planner', icon: Calendar },
  { path: '/inventory', label: 'Inventory & Fleet', icon: Package },
  { path: '/ops', label: 'Midday Ops', icon: Activity },
  { path: '/dash', label: 'Dashboards', icon: BarChart3 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Truck Optimize
            </h1>
            
            {/* Tab Navigation */}
            <nav className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                      transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Date Picker */}
          <DatePicker />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
