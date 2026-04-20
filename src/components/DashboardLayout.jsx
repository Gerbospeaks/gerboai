// components/SidebarLayout.jsx
// Drop-in layout wrapper used by ANY dashboard page.
// It reads user.dashboardId and renders the matching sidebar automatically.

import React from "react";
import MechanicsSidebar from '../pages/mechanics/MechanicsSidebar';
import SecuritySidebar from '../pages/security/SecuritySidebar';
import HealthSidebar from '../pages/health/HealthSidebar';
import ElectricalSidebar from '../pages/electrical/ElectricalSidebar';
import ConstructionSidebar from '../pages/construction/ConstructionSidebar';
import CleaningSidebar from '../pages/cleaning/CleaningSidebar';
import EducationSidebar from '../pages/education/EducationSidebar';
import HotelSidebar from '../pages/hotel/HotelSidebar';
import LegalSidebar from '../pages/legal/LegalSidebar';
import PlumbingSidebar from '../pages/plumbing/PlumbingSidebar';
import RetailSidebar from '../pages/retail/RetailSidebar';
import TechnologySidebar from '../pages/technology/TechnologySidebar';
import UpholsterySidebar from '../pages/upholstery/UpholsterySidebar';
import VirtualSidebar from '../pages/virtual/VirtualSidebar';
import LandscapingSidebar from '../pages/landscaping/LandscapingSidebar';
import LogisticsSidebar from '../pages/logistics/LogisticsSidebar';
import PhotographySidebar from '../pages/photography/PhotographySidebar';
import RealEstateSidebar from '../pages/realEstate/RealEstateSidebar';
import FlooringSidebar from '../pages/flooring/FlooringSidebar';
import WeldingSidebar from '../pages/welding/WeldingSidebar';  
import PaintingSidebar from '../pages/painting/PaintingSidebar';
import PestcontrolSidebar from '../pages/pest-contrrol/PestcontrolSidebar';
import PoolservicesSidebar from '../pages/pool-services/PoolservicesSidebar';
import SolarSidebar from '../pages/solar-installation/SolarSidebar'; 
import TowingSidebar from '../pages/towing/TowingSidebar';
import WindowrepairSidebar from '../pages/window-repair/WindowrepairSidebar';  
import HVACSidebar from '../pages/hvac/HVACSidebar';
import CarpentrySidebar from '../pages/carpentry/CarpentrySidebar';
import AccountingSidebar from '../pages/accounting/AccountingSidebar';
import AppHeader           from "../pages/AppHeader";

// ── Map dashboardId → sidebar component + AppHeader dashboardType ─────────────
const SIDEBAR_MAP = {
    mechanics:    { Component: MechanicsSidebar,    type: "mechanics"    },
    construction: { Component: ConstructionSidebar, type: "construction" },
    cleaning:     { Component: CleaningSidebar,     type: "cleaning"     },
    carpentry:    { Component: CarpentrySidebar,    type: "carpentry"    },
    electrical:   { Component: ElectricalSidebar,   type: "electrical"   },
    health:       { Component: HealthSidebar,       type: "health"       },
    hotel:        { Component: HotelSidebar,        type: "hotel"        },
    legal:        { Component: LegalSidebar,        type: "legal"        },
    logistics:    { Component: LogisticsSidebar,    type: "logistics"    },
    pestcontrol:  { Component: PestcontrolSidebar,  type: "pestcontrol"  },
    photography:  { Component: PhotographySidebar,  type: "photography"  },
    poolservices: { Component: PoolservicesSidebar, type: "poolservices" }, 
    realEstate:   { Component: RealEstateSidebar,   type: "realEstate"   },
    retail:       { Component: RetailSidebar,       type: "retail"       },
    solar:        { Component: SolarSidebar,        type: "solar"        },
    towing:       { Component: TowingSidebar,       type: "towing"       },
    windowrepair: { Component: WindowrepairSidebar, type: "windowrepair" },
    welding:      { Component: WeldingSidebar,      type: "welding"      },
    technology:   { Component: TechnologySidebar,   type: "technology"   },
    upholstery:   { Component: UpholsterySidebar,   type: "upholstery"   },
    virtual:      { Component: VirtualSidebar,      type: "virtual"      },
    landscaping:  { Component: LandscapingSidebar,  type: "landscaping"  },
    flooring:     { Component: FlooringSidebar,     type: "flooring"     },
    painting:     { Component: PaintingSidebar,     type: "painting"     },
    accounting:   { Component: AccountingSidebar,   type: "accounting"   },
    security:     { Component: SecuritySidebar,     type: "security"     },
    education:    { Component: EducationSidebar,    type: "education"    },
    accounting:   { Component: AccountingSidebar,   type: "accounting"   },
    cleaning:     { Component: CleaningSidebar,     type: "cleaning"     },

};

/**
 * SidebarLayout
 *
 * Wraps any dashboard page with:
 *   - AppHeader (sticky top, hamburger controls sidebar)
 *   - The correct sidebar for the logged-in user (left)
 *   - A scrollable main content area (right)
 *
 * Props:
 *   user              — Firebase auth user (needs user.dashboardId)
 *   sidebarOpen       — bool (lifted state from parent page)
 *   setSidebarOpen    — setter
 *   onQuickCreate     — fn({ view, action }) forwarded to AppHeader
 *   onSettingsOpen    — fn (opens settings modal)
 *   sidebarProps      — object — ALL extra props your sidebar needs
 *                       (activeView, setActiveView, handleNewInvoice, etc.)
 *   headerProps       — object — extra AppHeader props (pageTitle, plan, etc.)
 *   children          — the main content panel
 */
const DashboardLayout = ({
  user,
  sidebarOpen,
  setSidebarOpen,
  onQuickCreate    = () => {},
  onSettingsOpen,
  sidebarProps     = {},
  headerProps      = {},
  children,
}) => {
  const dashboardId = user?.dashboardId ?? "mechanics";
  const entry       = SIDEBAR_MAP[dashboardId] ?? SIDEBAR_MAP.mechanics;
  const Sidebar     = entry.Component;

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">

      {/* ── Sticky top header ── */}
      <AppHeader
        dashboardType={entry.type}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onQuickCreate={onQuickCreate}
        onSettingsOpen={onSettingsOpen}
        {...headerProps}
      />

      {/* ── Body: sidebar + main ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Sidebar — receives all the industry-specific props from parent */}
        <Sidebar
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          {...sidebarProps}
        />

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col min-h-0">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;