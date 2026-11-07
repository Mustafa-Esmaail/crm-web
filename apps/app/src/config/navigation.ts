import {
  Briefcase,
  Building,
  Building2,
  CalendarClock,
  Car,
  ClipboardList,
  FileDown,
  Gauge,
  GitBranch,
  GraduationCap,
  Handshake,
  Home,
  ListChecks,
  LockKeyhole,
  type LucideIcon,
  Network,
  Package,
  Plug,
  ScrollText,
  Settings,
  ShieldCheck,
  Stethoscope,
  Target,
  UserRound,
  Users,
  UsersRound,
  Warehouse,
} from 'lucide-react';

import { INDUSTRIES, type Industry } from './industries';
import { type Permission, PERMISSIONS } from './permissions';

export interface NavItem {
  id: string;
  /** Key inside the `nav.items` message namespace. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  /** Shown only to companies in this industry (an industry pack's screen). */
  industry?: Industry;
  /** Rendered dimmed and non-interactive until the module ships. */
  comingSoon?: boolean;
}

export interface NavSection {
  id: string;
  /** Key inside the `nav.sections` message namespace; omitted for the unlabeled top group. */
  labelKey?: string;
  items: NavItem[];
}

// Registry: a new module or industry pack adds entries here; the sidebar never changes.
export const NAVIGATION: NavSection[] = [
  {
    id: 'main',
    items: [{ id: 'home', labelKey: 'home', href: '/', icon: Home }],
  },
  {
    id: 'sales',
    labelKey: 'sales',
    items: [
      {
        id: 'leads',
        labelKey: 'leads',
        href: '/leads',
        icon: Target,
        permission: PERMISSIONS.leadsView,
      },
      {
        id: 'deals',
        labelKey: 'deals',
        href: '/deals',
        icon: Handshake,
        permission: PERMISSIONS.dealsView,
      },
      {
        id: 'tasks',
        labelKey: 'tasks',
        href: '/tasks',
        icon: ListChecks,
        permission: PERMISSIONS.tasksView,
      },
      {
        id: 'projects',
        labelKey: 'projects',
        href: '/projects',
        icon: Building,
        permission: PERMISSIONS.projectsView,
        industry: INDUSTRIES.realEstate,
      },
      {
        id: 'units',
        labelKey: 'units',
        href: '/units',
        icon: Warehouse,
        permission: PERMISSIONS.unitsView,
        industry: INDUSTRIES.realEstate,
      },
      {
        id: 'clinic-services',
        labelKey: 'clinicServices',
        href: '/clinic/services',
        icon: Stethoscope,
        permission: PERMISSIONS.clinicServicesView,
        industry: INDUSTRIES.clinic,
      },
      {
        id: 'clinic-appointments',
        labelKey: 'clinicAppointments',
        href: '/clinic/appointments',
        icon: CalendarClock,
        permission: PERMISSIONS.clinicAppointmentsView,
        industry: INDUSTRIES.clinic,
      },
      {
        id: 'education-courses',
        labelKey: 'educationCourses',
        href: '/education/courses',
        icon: GraduationCap,
        permission: PERMISSIONS.educationCoursesView,
        industry: INDUSTRIES.education,
      },
      {
        id: 'education-enrollments',
        labelKey: 'educationEnrollments',
        href: '/education/enrollments',
        icon: ClipboardList,
        permission: PERMISSIONS.educationEnrollmentsView,
        industry: INDUSTRIES.education,
      },
      {
        id: 'automotive-vehicles',
        labelKey: 'automotiveVehicles',
        href: '/automotive/vehicles',
        icon: Car,
        permission: PERMISSIONS.automotiveVehiclesView,
        industry: INDUSTRIES.automotive,
      },
      {
        id: 'automotive-test-drives',
        labelKey: 'automotiveTestDrives',
        href: '/automotive/test-drives',
        icon: Gauge,
        permission: PERMISSIONS.automotiveTestDrivesView,
        industry: INDUSTRIES.automotive,
      },
      {
        id: 'agency-packages',
        labelKey: 'agencyPackages',
        href: '/agency/packages',
        icon: Package,
        permission: PERMISSIONS.agencyPackagesView,
        industry: INDUSTRIES.agency,
      },
      {
        id: 'agency-engagements',
        labelKey: 'agencyEngagements',
        href: '/agency/engagements',
        icon: Briefcase,
        permission: PERMISSIONS.agencyEngagementsView,
        industry: INDUSTRIES.agency,
      },
    ],
  },
  {
    id: 'organization',
    labelKey: 'organization',
    items: [
      {
        id: 'employees',
        labelKey: 'employees',
        href: '/organization/employees',
        icon: Users,
        permission: PERMISSIONS.employeesView,
      },
      {
        id: 'departments',
        labelKey: 'departments',
        href: '/organization/departments',
        icon: Building2,
        permission: PERMISSIONS.departmentsView,
      },
      {
        id: 'teams',
        labelKey: 'teams',
        href: '/organization/teams',
        icon: UsersRound,
        permission: PERMISSIONS.teamsView,
      },
      {
        id: 'branches',
        labelKey: 'branches',
        href: '/organization/branches',
        icon: GitBranch,
        permission: PERMISSIONS.branchesView,
      },
      {
        id: 'org-chart',
        labelKey: 'orgChart',
        href: '/organization/org-chart',
        icon: Network,
        permission: PERMISSIONS.employeesView,
      },
    ],
  },
  {
    id: 'admin',
    labelKey: 'admin',
    items: [
      {
        id: 'roles',
        labelKey: 'roles',
        href: '/access/roles',
        icon: ShieldCheck,
        permission: PERMISSIONS.rolesView,
      },
      {
        id: 'audit-log',
        labelKey: 'auditLog',
        href: '/settings/audit-log',
        icon: ScrollText,
        permission: PERMISSIONS.auditLogsView,
      },
      {
        id: 'channels',
        labelKey: 'channels',
        href: '/settings/channels',
        icon: Plug,
        permission: PERMISSIONS.channelConnectionsView,
      },
      {
        id: 'export-requests',
        labelKey: 'exportRequests',
        href: '/settings/export-requests',
        icon: FileDown,
        permission: PERMISSIONS.leadsExport,
      },
      {
        id: 'pipeline-settings',
        labelKey: 'pipelineSettings',
        href: '/settings/pipeline',
        icon: Settings,
        permission: PERMISSIONS.leadSettingsManage,
      },
      {
        id: 'security',
        labelKey: 'security',
        href: '/settings/security',
        icon: LockKeyhole,
        permission: PERMISSIONS.securityManage,
      },
    ],
  },
];

export const PROFILE_ICON = UserRound;
