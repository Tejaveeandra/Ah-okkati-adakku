import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import styles from "./ApplicationModuleContainer.module.css";
import AnalyticsWholeContainer from "../application-analytics-containers/analytics-whole-container/AnalyticsWholeContainer";
import ApplicationSearchContainer from "../application-analytics-containers/application-search-container/ApplicationSearchContainer";
import ApplicationNavLinksContainer from "../application-analytics-containers/application-nav-links-container/ApplicationNavLinksContainer";
import DistributeTab from "../../components/application-distribution/DistributeTab";
import ApplicationStatus from "../../components/application-status/ApplicationComponent/ApplicationStatus/ApplicationStatus";
import SaleForm from "../../components/application-status/Sale&Conformation/SaleForm/SaleForm";
import Damaged from "../../components/application-status/Damaged/DamagedRefactored";

const ApplicationModuleContainer = () => {
  const location = useLocation();
  
  // Debug: Track route changes
  console.log('🔄 ApplicationModuleContainer rendered');
  console.log('🔄 Current pathname:', location.pathname);
  
  const isDistribute = location.pathname.includes("/distribute");
  const isStatus = location.pathname.includes("/status");
  const isDamage = location.pathname.includes("/damage");
  const isSaleOrConfirmation = location.pathname.match(/\/status\/[^\/]+\/(sale|confirm)/);
  
  console.log('🔄 Route flags:', { isDistribute, isStatus, isDamage, isSaleOrConfirmation });

  // Debug: Track route changes
  useEffect(() => {
    console.log('🔄 ApplicationModuleContainer route changed to:', location.pathname);
  }, [location.pathname]);

  return (
    <div className={styles.main_content}>
      {/* Hide search when in distribute, status, or damage */}
      {!isDistribute && !isStatus && !isDamage && <ApplicationSearchContainer />}

      {/* Hide navigation tabs when in sale or confirmation pages, but keep visible for damage */}
      {!isSaleOrConfirmation && <ApplicationNavLinksContainer />}

      <div
        id="analytics_wrapper"
        className={`${styles.analytics_wrapper} ${
          isDistribute ? styles.column : styles.row
        }`}
      >
        <Routes>
          {/* Default redirect → /analytics */}
          
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<AnalyticsWholeContainer />} />
          <Route path="distribute/*" element={<DistributeTab />} />
          <Route
            path="status/:applicationNo/:status"
            element={<SaleForm />}
          />
          <Route path="status" element={<ApplicationStatus key={location.pathname} />} />
          <Route path="damage" element={<Damaged />} />
        </Routes>
        
        
      </div>
    </div>
  );
};

export default ApplicationModuleContainer;
