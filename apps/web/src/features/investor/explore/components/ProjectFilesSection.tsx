interface ProjectFileItem {
    id: string;
    fileName: string;
    fileType: string;
    mimeType: string;
    fileSize: number | null;
    url: string;
  }
  
  interface ProjectFilesSectionProps {
    files: ProjectFileItem[];
  }
  
  export default function ProjectFilesSection({ files }: ProjectFilesSectionProps) {
    return (
      <section className="project-details-section">
        <div className="project-details-section__header">
          <h2>الملفات المرفوعة</h2>
        </div>
  
        {files.length === 0 ? (
          <div className="project-empty-box">لا توجد ملفات مرفوعة لهذا المشروع.</div>
        ) : (
          <div className="project-files-list">
            {files.map((file: ProjectFileItem) => (
              <div key={file.id} className="project-file-card">
                <div>
                  <h3>{file.fileName}</h3>
                  <p>
                    {file.fileType} {file.mimeType ? `• ${file.mimeType}` : ""}
                  </p>
                  <span>
                    {file.fileSize !== null
                      ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
                      : "الحجم غير متوفر"}
                  </span>
                </div>
  
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--ghost"
                >
                  فتح الملف
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }