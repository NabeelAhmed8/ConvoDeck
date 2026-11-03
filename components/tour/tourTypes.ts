export type TourCategory = "Navigation" | "Action" | "Connection" | "Account" | "Control";

export interface ITourStep {
  id: string;
  targetId: string;
  title: string;
  category: TourCategory;
  description: string;
  iconName: string;
}

export interface TourGuideProps {
  onExpandMobileDrawer?: () => void;
  onCollapseMobileDrawer?: () => void;
  onExpandDesktopSidebar?: () => void;
}

