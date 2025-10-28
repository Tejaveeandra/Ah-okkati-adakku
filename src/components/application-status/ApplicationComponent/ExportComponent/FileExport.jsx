import React, { useState } from "react";
import styles from "./FileExport.module.css";
import { exportToPDF, exportToXLS, exportToDOC, getSelectedRecords, hasSelectedRecords } from "./utils/exportUtils";

const FileExport = ({ onExport, data = [] }) => {
  const [selectedType, setSelectedType] = useState("Pdf");

  const fileTypes = ["Pdf", ".xls", "doc"];

  const handleSelect = (type) => {
    setSelectedType(type);
    
    // Get selected records
    const selectedRecords = getSelectedRecords(data);
    
    if (selectedRecords.length === 0) {
      alert('Please select at least one record to export.');
      return;
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `application-status-${timestamp}`;
    
    // Call appropriate export function
    switch (type) {
      case "Pdf":
        exportToPDF(selectedRecords, `${filename}.pdf`);
        break;
      case ".xls":
        exportToXLS(selectedRecords, `${filename}.xls`);
        break;
      case "doc":
        exportToDOC(selectedRecords, `${filename}.doc`);
        break;
      default:
        console.warn('Unknown export type:', type);
    }
    
    // Call the original onExport callback if provided
    if (onExport) {
      onExport(type, selectedRecords);
    }
  };

  const selectedCount = getSelectedRecords(data).length;
  const hasSelection = hasSelectedRecords(data);

  return (
    <div className={styles.exportContainer}>
      <div className={styles.fileTypeWrapper}>
        <span className={styles.fileTypeLabel}>File Type</span>
        <div className={styles.fileTypeOptions}>
          {fileTypes.map((type) => (
            <button
              key={type}
              className={`${styles.fileTypeBtn} ${
                selectedType === type ? styles.active : ""
              }`}
              onClick={() => handleSelect(type)}
              disabled={!hasSelection}
            >
              {type}
            </button>
          ))}
        </div>
        {hasSelection && (
          <div className={styles.selectionInfo}>
            <span className={styles.selectionCount}>
              {selectedCount} record{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}
        {!hasSelection && (
          <div className={styles.noSelectionWarning}>
            <span>Please select records to export</span>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default FileExport;
 