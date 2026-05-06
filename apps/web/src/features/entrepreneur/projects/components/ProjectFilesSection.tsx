import type { ProjectFileItem } from "./project-details.types";

type ProjectFilesSectionProps = {
  files: ProjectFileItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatFileSize(value: number | null) {
  if (!value || Number.isNaN(value)) {
    return "غير محدد";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileType(value: string) {
  switch (value) {
    case "pitch_deck":
      return "عرض تقديمي";
    case "business_plan":
      return "خطة عمل";
    case "financials":
      return "ملفات مالية";
    case "prototype":
      return "Prototype";
    case "legal":
      return "ملف قانوني";
    case "other":
      return "أخرى";
    default:
      return value;
  }
}

export default function ProjectFilesSection({ files }: ProjectFilesSectionProps) {
  return (
    <section className="entrepreneur-detail-card">
      <div className="entrepreneur-section-heading">
        <h2>الملفات المرفوعة</h2>
      </div>

      {!files.length ? (
        <div className="entrepreneur-empty-mini">لا توجد ملفات مرفوعة لهذا المشروع.</div>
      ) : (
        <div className="entrepreneur-files-list">
          {files.map((file) => (
            <article key={file.id} className="entrepreneur-file-card">
              <div>
                <h3>{file.fileName}</h3>
                <p>
                  {formatFileType(file.fileType)} • {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
                </p>
              </div>

              {file.publicUrl ? (
                <a
                  href={file.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--ghost btn--sm"
                >
                  فتح الملف
                </a>
              ) : (
                <span className="entrepreneur-file-card__path">
                  {file.bucketName && file.storagePath ? `${file.bucketName} / ${file.storagePath}` : "لا يوجد رابط"}
                </span>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}