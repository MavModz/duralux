import "../assets/scss/theme.scss";
import 'react-circular-progressbar/dist/styles.css';
import "react-perfect-scrollbar/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import NavigationProvider from "@/contentApi/navigationProvider";
import SettingSideBarProvider from "@/contentApi/settingSideBarProvider";
import ThemeCustomizer from "@/components/shared/ThemeCustomizer";
import LoginHandler from "@/components/auth/LoginHandler";
import UserOnlineTracker from "@/components/auth/UserOnlineTracker";
import LogoutModal from "@/components/shared/LogoutModal";
import UnauthorizedModal from "@/components/shared/UnauthorizedModal";
import { Suspense } from "react";

export const metadata = {
  title: "STRIDE | The Best CRM & Marketing Automation Platform",
  description: "Create, share, and earn from your courses—all in one earning platform for creators. Turn your knowledge into profit with Nrich.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <LoginHandler />
        </Suspense>
        <UserOnlineTracker />
        <LogoutModal />
        <UnauthorizedModal />
        <SettingSideBarProvider>
          <NavigationProvider>
            {children}
          </NavigationProvider>
        </SettingSideBarProvider>
        <ThemeCustomizer />
      </body>
    </html>
  );
}
